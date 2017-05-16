import Bluebird from 'bluebird';
import get from 'lodash/get';
import uuidV4 from 'uuid/v4';

import { scheduleReminder, unscheduleReminder, allScheduled } from './notifications';
import config from './config-lib/index';
import { database as db } from './app_ready';
import { setValue, deleteValue, getValues, initializeIfNotSet } from './db-helpers';

const todosTable = db.sublevel('todos');
const remindersTable = db.sublevel('reminders');

function getConfig () {
  return Bluebird
    .props({
      todos: getValues(todosTable),
      reminders: getValues(remindersTable)
    });
}

const dbInitialized = Bluebird
  .map(['todos', 'reminders'], sub => {
    initializeIfNotSet(db.sublevel(sub), sub, config.get(`templates:${sub}`));
  });

const routes = {
  configure (server) {
    server.on('get-scheduled', (req, next) => {
      next(null, allScheduled);
    });

    server.on('get-config', (req, next) => {
      return dbInitialized
        .then(getConfig)
        .asCallback(next);
    });

    server.on('add-todo', (req, next) => {
      const value = get(req, 'body.todo');
      const id = uuidV4();
      value.id = id;
      return setValue(todosTable, id, value)
        .return(value)
        .asCallback(next);
    });

    server.on('edit-todo', (req, next) => {
      const value = get(req, 'body.todo');
      return setValue(todosTable, value.id, value)
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
  }
};

export default routes;
