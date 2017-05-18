import Bluebird from 'bluebird';

// import errors from 'level-errors';
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

export function getValues (db) {
  const values = [];
  return new Bluebird((resolve, reject) => {
    db.createValueStream()
    .on('data', function (data) {
      values.push(data);
    })
    .on('end', () => resolve(values))
    .on('error', reject);
  });
}

export function initializeIfNotSet (db, sub, valueArray) {
  return Bluebird
    .each(valueArray, (value, index) => {
      return _getValue(db, value.id)
        .catch(() => { // Bluebird filter facility isn't working for errors.NotFoundError
          logger.info(`Initializing ${sub}::${value.id}`);
          return _setValue(db, value.id, Object.assign(value, { system: true, order: index }));
        });
    });
}

export function deleteValue (db, key) {
  return Bluebird
    .fromCallback(db.del.bind(db, key, { sync: true }))
    .catch(() => {}); // suppress delete errors
}

export const setValue = _setValue;
export const getValue = _getValue;
