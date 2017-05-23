import Bluebird from 'bluebird';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import map from 'lodash/map';
import find from 'lodash/find';
import uuidV4 from 'uuid/v4';

import { scheduleReminder, unscheduleReminder, allScheduled } from './notifications';
import config from './config-lib/index';
import { getLogger, database as db } from './app_ready';
import { setValue, deleteValue, getValues, initializeIfNotSet, setValueAfterLookupIndex, getValueAfterLookupIndex } from './db-helpers';

const todosTable = db.sublevel('todos');
const remindersTable = db.sublevel('reminders');
const todosIndexTable = db.sublevel('todosIndex');
const TODOS_INDEX_PROP = 'templateId';

const ordersTable = db.sublevel('orders');
const ordersIndexTable = db.sublevel('ordersIndex');
const ORDER_INDEX_PROP = value => `${value.templateId}-${value.todoId}`;

const logger = getLogger({ label: 'routes' });

function getTodos (todosTemplateId) {
  return Bluebird
    .props({
      todos: getValues(todosTable, { indexPropValue: todosTemplateId, indexSub: todosIndexTable }),
      baseTodos: getValues(todosTable, { indexPropValue: 'base', indexSub: todosIndexTable }),
      orders: getValues(ordersTable, { indexPropValue: todosTemplateId, indexSub: ordersIndexTable })
    })
    .then(({ todos, baseTodos, orders }) => {
      return map([...todos, ...baseTodos], todo => {
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
    });
    /* .tap(result => {
      console.log(JSON.stringify(sortBy(result.todos, 'order')));
    }); */
}

const dbInitialized = Bluebird.all([
  initializeIfNotSet(todosTable, 'todos', config.get(`templates:todos`), { indexProp: TODOS_INDEX_PROP, indexSub: todosIndexTable }),
  initializeIfNotSet(ordersTable, 'orders', config.get(`templates:orders`), { indexProp: ORDER_INDEX_PROP, indexSub: ordersIndexTable }),
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
          indexProp: TODOS_INDEX_PROP,
          indexSub: todosIndexTable
        }),
        savedOrder: setValue(ordersTable, orderId, {
          order,
          templateId: orderTemplateId,
          todoId: id
        }, {
          indexProp: ORDER_INDEX_PROP,
          indexSub: ordersIndexTable
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
        indexProp: ORDER_INDEX_PROP,
        indexSub: ordersIndexTable
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
              deleteValue(todosTable, id, { indexProp: TODOS_INDEX_PROP, indexSub: todosIndexTable }),
              deleteValue(remindersTable, id)
            ]);
        })
        .then(deletedTodo => {
          return getValueAfterLookupIndex(ordersTable, {
            order: deletedTodo.order,
            templateId: deletedTodo.orderTemplateId,
            todoId: id
          }, {
            indexProp: ORDER_INDEX_PROP,
            indexSub: ordersIndexTable
          });
        })
        .then(orderId => {
          return deleteValue(ordersTable, orderId, {
            indexProp: ORDER_INDEX_PROP,
            indexSub: ordersIndexTable
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
