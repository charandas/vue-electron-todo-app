import Bluebird from 'bluebird';
import { getLogger } from './app_ready';

const logger = getLogger({ label: 'db-helpers' });

export function initializeValue (db, key, value) {
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

export function getValue (db, key) {
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
