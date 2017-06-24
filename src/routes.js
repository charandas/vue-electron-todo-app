import Bluebird from 'bluebird';
import { app } from 'electron';
import jetpack from 'fs-jetpack';
import moment from 'moment';
import get from 'lodash/get';
// import sortBy from 'lodash/sortBy';
import find from 'lodash/find';
import maxBy from 'lodash/maxBy';
import partial from 'lodash/partial';
import uuidV4 from 'uuid/v4';

import { scheduleReminder, unscheduleReminder, allScheduled } from './notifications';
import config from './config-lib/index';
import { getLogger, database as db } from './app_ready';
import { setValue, deleteValue, getValues, initializeIfNotSet, setValueAfterLookupIndex, lookupIndex } from './db-helpers';
import { extractAudioFromVideo } from './audio';

const INITIALIZED_STATE_FILE = 'initalized.json';

const templates = config.get('workflows:templates');
const baseTemplateMetadata = find(templates, { value: 'base' });

const todosTable = db.sublevel('todos');
const remindersTable = db.sublevel('reminders');
const TODOS_INDEX_PROP = value => `${value.templateId}-${value.id}`;

const ordersTable = db.sublevel('orders');
const ORDER_INDEX_PROP = value => `${value.templateId}-${value.todoId}`;

const logger = getLogger({ label: 'routes' });
const userData = jetpack.cwd(app.getPath('userData'));

function nextOrder (orders) {
  const nextOrderNumber = maxBy(orders, 'order').order + 1;
  return nextOrderNumber;
}

function makeupAndSaveNewOrder (orders, templateId, todo) {
  logger.warn(`Missing order for todo ${todo.id} for template ${templateId}`);
  logger.info(`Assuming new todo: ${todo.title}`);
  const order = nextOrder(orders);

  const orderToSave = {
    order,
    templateId,
    todoId: todo.id
  };
  return setValue(ordersTable, uuidV4(), orderToSave, {
    indexProp: ORDER_INDEX_PROP
  });
}

// The value of returned promise is simply a todo with existing order field attached
function addOrderToTodo (orders, templateId, todo) {
  const _order = find(orders, { todoId: todo.id });
  return Bluebird
    .resolve(_order || makeupAndSaveNewOrder(orders, templateId, todo))
    .then(order => Object.assign(todo, { order: order.order }));
}

function deleteOrderInDb (todoId, templateId) {
  return lookupIndex(ordersTable, {
    templateId: templateId,
    todoId
  }, {
    indexProp: ORDER_INDEX_PROP
  })
    .then(orderId => deleteValue(ordersTable, orderId, {
      indexProp: ORDER_INDEX_PROP
    }));
}

function getTodos (todosTemplateId) {
  const promises = {
    baseTodos: getValues(todosTable, { indexPropValue: 'base' }),
    orders: getValues(ordersTable, { indexPropValue: todosTemplateId })
  };

  if (todosTemplateId !== 'base') {
    Object.assign(promises, {
      todos: getValues(todosTable, { indexPropValue: todosTemplateId })
    });
  }

  return Bluebird
    .props(promises)
    .then(({ todos, baseTodos, orders }) => {
      let allTodos = [ ...baseTodos ];
      if (todos) {
        allTodos.push(...todos);
      }

      return Bluebird
        .map(allTodos, partial(addOrderToTodo, orders, todosTemplateId));
    });
}

function getConfig (todosTemplateId) {
  return Bluebird
    .props({
      templateIds: config.get('workflows:templates'),
      todos: getTodos(todosTemplateId),
      reminders: getValues(remindersTable)
    });
    /* .tap(result => {
      console.log(JSON.stringify(sortBy(result.todos, 'order')));
    }); */
}

function initializeAndCheckpointState () {
  return Bluebird
    .all([
      initializeIfNotSet(todosTable, 'todos', config.get('templates:todos'), { indexProp: TODOS_INDEX_PROP }),
      initializeIfNotSet(ordersTable, 'orders', config.get('templates:orders'), { indexProp: ORDER_INDEX_PROP }),
      initializeIfNotSet(remindersTable, 'reminders', config.get('templates:reminders'))
    ])
    .then(() => {
      return jetpack.write(userData.path(INITIALIZED_STATE_FILE), {
        lastInitialized: moment().format()
      }, {
        atomic: true
      });
    })
    .return(true);
}

function initialize () {
  return Bluebird
    .resolve(jetpack.existsAsync(userData.path(INITIALIZED_STATE_FILE)))
    .then(existing => {
      if (existing === 'file') {
        // did not need to initialize, checkpoint exists
        return false;
      }
      return initializeAndCheckpointState();
    });
}

const routes = {
  configure (server) {
    server.on('get-scheduled', (req, next) => {
      next(null, allScheduled);
    });

    server.on('get-config', (req, next) => {
      const value = get(req, 'body.options', {});
      return initialize()
        .then(neededInitialize => {
          return Bluebird.props({
            neededInitialize,
            configResult: getConfig(value.templateId)
          });
        })
        .then(({ configResult, neededInitialize }) => Object.assign(configResult, { hardRefresh: neededInitialize }))
        .asCallback(next);
    });

    // Adding is always on the template itself, not on a parent, so we need not use orderTemplateId property
    server.on('add-todo', (req, next) => {
      const value = get(req, 'body.todo');
      const isEdit = !!value.id;
      const id = value.id || uuidV4();
      value.id = id;

      const order = value.order;
      const orderTemplateId = value.templateId;
      delete value.order;
      delete value.orderTemplateId;

      const orderToSave = {
        order,
        templateId: orderTemplateId,
        todoId: id
      };

      const savedOrderPromise = isEdit
        ? setValueAfterLookupIndex(ordersTable, orderToSave, { indexProp: ORDER_INDEX_PROP })
        : setValue(ordersTable, uuidV4(), orderToSave, { indexProp: ORDER_INDEX_PROP });

      logger.silly('add-todo payload', value);
      return Bluebird
      .props({
        savedTodo: setValue(todosTable, id, value, {
          indexProp: TODOS_INDEX_PROP
        }),
        savedOrderPromise
      })
      .return(Object.assign(value, { order: order }))
      .asCallback(next);
    });

    server.on('reorder-todo', (req, next) => {
      const value = get(req, 'body.todo');
      const id = value.id || uuidV4();
      value.id = id;

      const order = value.order;
      const orderTemplateId = value.orderTemplateId;
      delete value.orderTemplateId;

      logger.silly('reorder-todo payload', value);
      return setValueAfterLookupIndex(ordersTable, {
        order,
        templateId: orderTemplateId,
        todoId: id
      }, {
        indexProp: ORDER_INDEX_PROP
      })
      .return(value)
      .asCallback(next);
    });

    server.on('remove-todo', (req, next) => {
      const value = get(req, 'body.todo');
      const id = value.id;

      return Bluebird
        .resolve(value)
        .tap(unscheduleReminder)
        .tap(() => {
          return Bluebird
            .all([
              deleteValue(todosTable, id, { indexProp: TODOS_INDEX_PROP }),
              deleteValue(remindersTable, id)
            ]);
        })
        .then(deletedTodo => {
          let deleteOrdersForTemplateIds = [ deletedTodo.orderTemplateId ];
          if (deletedTodo.orderTemplateId === 'base') {
            deleteOrdersForTemplateIds.push(...baseTemplateMetadata.children);
          }
          return Bluebird.map(deleteOrdersForTemplateIds, templateId => deleteOrderInDb(deletedTodo.id, templateId));
        });
    });

    server.on('add-reminder', (req, next) => {
      const value = get(req, 'body.reminder');
      const id = value.todoId;
      return setValue(remindersTable, id, value)
        .return(value)
        .tap(scheduleReminder)
        .asCallback(next);
    });

    server.on('remove-reminder', (req, next) => {
      const value = get(req, 'body.reminder');
      const id = value.todoId;
      return deleteValue(remindersTable, id)
        .return(value)
        .tap(unscheduleReminder)
        .asCallback(next);
    });

    server.on('extract-audio', (req, next) => {
      const task = get(req, 'body.task');
      if (!task || !task.movieUrl) {
        return next(new Error('Missing task payload'));
      }
      return extractAudioFromVideo(task)
        .asCallback(next);
    });
  }
};

export default routes;
