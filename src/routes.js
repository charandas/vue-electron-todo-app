import Bluebird from 'bluebird';

import config from './config-lib/index';
import { getLogger, database as db } from './app_ready';

const logger = getLogger({ label: 'routes' });

function initializeValue (key) {
  return new Bluebird((resolve, reject) => {
    db.put(key, config.get(key), function (err) {
      if (err) {
        logger.error(err);
        reject(err);
      }

      resolve(true);
    });
  });
}

function getValue (key) {
  return new Bluebird((resolve, reject) => {
    db.get(key, function (err, value) {
      if (err) {
        logger.error(err);
        reject(err);
      }

      resolve(value);
    });
  });
}

function getConfig () {
  return Bluebird
    .props({
      checklist: getValue('checklist'),
      reminders: getValue('reminders')
    });
}

const dbInitialized = Bluebird
  .map(['checklist', 'reminders'], initializeValue);

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
