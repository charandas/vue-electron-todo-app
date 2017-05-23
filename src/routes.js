import Bluebird from 'bluebird';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import map from 'lodash/map';
import find from 'lodash/find';
import uuidV4 from 'uuid/v4';

import { scheduleReminder, unscheduleReminder, allScheduled } from './notifications';
import config from './config-lib/index';
import { getLogger, database as db } from './app_ready';
import { setValue, deleteValue, getValues, initializeIfNotSet, setValueAfterLookupIndex, lookupIndex } from './db-helpers';

const todosTable = db.sublevel('todos');
const remindersTable = db.sublevel('reminders');
const TODOS_INDEX_PROP = value => `${value.templateId}-${value.id}`;

const ordersTable = db.sublevel('orders');
const ORDER_INDEX_PROP = value => `${value.templateId}-${value.todoId}`;

const logger = getLogger({ label: 'routes' });

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
      return map(allTodos, todo => {
        const order = find(orders, { todoId: todo.id });
        return Object.assign(todo, { order: order.order });
      });
    });
}

function getConfig (todosTemplateId) {
  return Bluebird
    .props({
      templateIds: config.get('workflows:templateIds'),
      todos: getTodos(todosTemplateId),
      reminders: getValues(remindersTable)
    })
    .tap(result => {
      console.log(JSON.stringify(sortBy(result.todos, 'order')));
    });
}

const dbInitialized = Bluebird.all([
  initializeIfNotSet(todosTable, 'todos', config.get(`templates:todos`), { indexProp: TODOS_INDEX_PROP }),
  initializeIfNotSet(ordersTable, 'orders', config.get(`templates:orders`), { indexProp: ORDER_INDEX_PROP }),
  initializeIfNotSet(remindersTable, 'reminders', config.get(`templates:reminders`))
]);

const routes = {
  configure (server) {
    server.on('get-scheduled', (req, next) => {
      next(null, allScheduled);
    });

    server.on('get-config', (req, next) => {
      const value = get(req, 'body.options', {});
      return dbInitialized
        .return(value.templateId)
        .then(getConfig)
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
          return lookupIndex(ordersTable, {
            order: deletedTodo.order,
            templateId: deletedTodo.orderTemplateId,
            todoId: id
          }, {
            indexProp: ORDER_INDEX_PROP
          });
        })
        .then(orderId => {
          return deleteValue(ordersTable, orderId, {
            indexProp: ORDER_INDEX_PROP
          });
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
