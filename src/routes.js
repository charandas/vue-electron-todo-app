import Bluebird from 'bluebird';
import get from 'lodash/get';
import uuidV4 from 'uuid/v4';

import { scheduleReminder, unscheduleReminder, allScheduled } from './notifications';
import config from './config-lib/index';
import { database as db } from './app_ready';
import { setValue, deleteValue, getValues, initializeIfNotSet } from './db-helpers';

const todosTable = db.sublevel('todos');
const remindersTable = db.sublevel('reminders');
const todosIndexTable = db.sublevel('todosIndex');

function getConfig (todosTemplateId) {
  return Bluebird
    .props({
      templateIds: config.get('workflows:templateIds'),
      todos: getValues(todosTable, { indexPropValue: todosTemplateId, indexSub: todosIndexTable }),
      reminders: getValues(remindersTable)
    })
    .tap(result => {
      console.log(result.todos);
    });
}

const dbInitialized = Bluebird.all([
  initializeIfNotSet(todosTable, 'todos', config.get(`templates:todos`), { indexProp: 'templateId', indexSub: todosIndexTable }),
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
      return setValue(todosTable, id, value, {
        indexProp: 'templateId',
        indexSub: todosIndexTable
      })
        .return(value)
        .asCallback(next);
    });

    server.on('remove-todo', (req, next) => {
      const value = get(req, 'body.todo');
      const id = value.id;
      return Bluebird
        .resolve(value)
        .then(unscheduleReminder)
        .then(() => {
          return Bluebird.all([ deleteValue(todosTable, id), deleteValue(remindersTable, id) ]);
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
