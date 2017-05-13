import Bluebird from 'bluebird';

import config from './config-lib/index';
import { database as db } from './app_ready';
import { initializeValue, getValue } from './db-helpers';

// const logger = getLogger({ label: 'routes' });

function getConfig () {
  return Bluebird
    .props({
      checklist: getValue(db, 'checklist'),
      reminders: getValue(db, 'reminders')
    });
}

const dbInitialized = Bluebird
  .map(['checklist', 'reminders'], key => initializeValue(db, key, config.get(key)));

const routes = {
  configure (server) {
    server.on('get-snoozed', (req, next) => {
      next(null, global.snoozed);
    });

    server.on('get-config', (req, next) => {
      return dbInitialized
        .then(getConfig)
        .asCallback(next);
    });
  }
};

export default routes;
