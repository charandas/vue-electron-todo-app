import Bluebird from 'bluebird';
import get from 'lodash/get';
import uuidV4 from 'uuid/v4';

import pl from 'pull-level';
import pull from 'pull-stream';

import { scheduleReminder, allScheduled } from './notifications';
import config from './config-lib/index';
import { database as db } from './app_ready';
import { setValue, getValue, initializeIfNotSet } from './db-helpers';

const todosTable = db.sublevel('todos');
// const remindersTable = db.sublevel('reminders');

function getConfig () {
  return Bluebird
    .props({
      checklist: getValue(db, 'checklist'),
      reminders: getValue(db, 'reminders')
    });
}

const dbInitialized = Bluebird
  .map(['checklist', 'reminders'], key => initializeIfNotSet(db, key, config.get(`templates:${key}`)));

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
      pull(
        pull.values([
          { key: id, value, type: 'put' }
          // { key: `~INDEX~${id}`, value: id, type: 'put' }
        ]),
        pl.write(todosTable)
      );
    });

    // server.on('get-todos')

    server.on('add-reminder', (req, next) => {
      getValue(db, 'reminders')
        .then(reminders => {
          scheduleReminder(req.body.reminder);
          reminders.push(req.body.reminder);
          return setValue(db, 'reminders', reminders).return(reminders);
        })
        .asCallback(next);
    });
  }
};

export default routes;
