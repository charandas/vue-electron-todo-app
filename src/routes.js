import Bluebird from 'bluebird';

import { scheduleReminder, allScheduled } from './notifications';
import config from './config-lib/index';
import { database as db } from './app_ready';
import { setValue, getValue, initializeIfNotSet } from './db-helpers';

// const logger = getLogger({ label: 'routes' });

function getConfig () {
  return Bluebird
    .props({
      checklist: getValue(db, 'checklist'),
      reminders: getValue(db, 'reminders')
    });
}

const dbInitialized = Bluebird
  .map(['checklist', 'reminders'], key => initializeIfNotSet(db, key, config.get(key)));

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
