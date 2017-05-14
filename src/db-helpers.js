import Bluebird from 'bluebird';

import errors from 'level-errors';
import { getLogger } from './app_ready';

const logger = getLogger({ label: 'db-helpers' });

function _getValue (db, key) {
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

function _setValue (db, key, value) {
  return new Bluebird((resolve, reject) => {
    db.put(key, value, function (err) {
      if (err) {
        logger.error(err);
        reject(err);
      }

      resolve(true);
    });
  });
}

export function initializeIfNotSet (db, key, value) {
  return _getValue(db, key)
    .catch(errors.NotFoundError, () => {
      logger.info(`Initializing ${key}`);
      return _setValue(db, key, value);
    });
}

export const setValue = _setValue;
export const getValue = _getValue;
