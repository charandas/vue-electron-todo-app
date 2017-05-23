import Bluebird from 'bluebird';
import { app } from 'electron';
import jetpack from 'fs-jetpack';
import moment from 'moment';
import get from 'lodash/get';
// import sortBy from 'lodash/sortBy';
import fp from 'lodash/fp';
import find from 'lodash/find';
import partial from 'lodash/partial';
import uuidV4 from 'uuid/v4';

import { scheduleReminder, unscheduleReminder, allScheduled } from './notifications';
import config from './config-lib/index';
import { getLogger, database as db } from './app_ready';
import { setValue, deleteValue, getValues, initializeIfNotSet, setValueAfterLookupIndex, lookupIndex } from './db-helpers';

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

function addOrderToTodo (orders, templateId, todo) {
  const order = find(orders, { todoId: todo.id });
  if (!order) {
    logger.warn(`Missing order for todo ${todo.id} for template ${templateId}`);
    return;
  }
  return Object.assign(todo, { order: order.order });
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
        allTodos = [ ...allTodos, ...todos ];
      }
      return fp.flow(
        fp.map(partial(addOrderToTodo, orders, todosTemplateId)),
        fp.filter(Boolean)
      )(allTodos);
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

    server.on('add-todo', (req, next) => {
      const value = get(req, 'body.todo');
      const id = value.id || uuidV4();
      value.id = id;

      const order = value.order;
      const orderTemplateId = value.orderTemplateId;
      delete value.order;
      delete value.orderTemplateId;

      const orderId = uuidV4();

      logger.silly('add-todo payload', value);
      return Bluebird
      .props({
        savedTodo: setValue(todosTable, id, value, {
          indexProp: TODOS_INDEX_PROP
        }),
        savedOrder: setValue(ordersTable, orderId, {
          order,
          templateId: orderTemplateId,
          todoId: id
        }, {
          indexProp: ORDER_INDEX_PROP
        })
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
            deleteOrdersForTemplateIds = [
              ...deleteOrdersForTemplateIds,
              ...baseTemplateMetadata.children
            ];
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
  }
};

export default routes;
