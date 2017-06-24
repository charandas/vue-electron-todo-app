import Bluebird from 'bluebird';
import assert from 'assert';
import isEqual from 'lodash/isEqual';

// import errors from 'level-errors';
import { getLogger } from './app_ready';

const logger = getLogger({ label: 'db-helpers' });

// Getting single value is never useful when using an index,
// as you might as well lookup using a foreign key
// Hence, we choose to not implement any indexing related logic on this function
function _getValue (db, key) {
  return new Bluebird((resolve, reject) => {
    db.get(key, function (err, value) {
      if (err) {
        logger.info(`Tried key ${key}`);
        logger.error(err);
        reject(err);
      }

      resolve(value);
    });
  });
}

export function setValueAfterLookupIndex (db, value, { indexProp }) {
  assert(typeof indexProp === 'function');
  const indexKey = `~INDEX~${indexProp(value)}`;
  return _getValue(db, indexKey)
    .then(index => _setValue(db, index, value));
}

export function lookupIndex (db, value, { indexProp }) {
  assert(typeof indexProp === 'function');
  logger.info('to delete', value);
  const indexKey = `~INDEX~${indexProp(value)}`;
  return _getValue(db, indexKey);
}

// Options: { indexProp: null }
function _setValue (db, key, value, options = {}) {
  const values = [
    { key, value }
  ];
  if (options.indexProp) {
    assert(typeof options.indexProp === 'function');
    values.push({ key: `~INDEX~${options.indexProp(value)}`, value: key });
  }
  return new Bluebird((resolve, reject) => {
    db.batch(values, function (err) {
      if (err) {
        logger.error(err);
        reject(err);
      }

      resolve(value);
    });
  });
}

// Options: { indexPropValue: null }
export function getValues (db, options = {}) {
  const getOptions = {};
  if (options.indexPropValue) {
    Object.assign(getOptions, {
      gte: `~INDEX~${options.indexPropValue}`,
      lte: `~INDEX~${options.indexPropValue}~`
    });
  }
  const values = [];
  const promise = new Bluebird((resolve, reject) => {
    db.createValueStream(getOptions)
    .on('data', function (data) {
      values.push(data);
    })
    .on('end', () => resolve(values))
    .on('error', reject);
  });

  if (!options.indexPropValue) {
    return promise;
  }

  // Otherwise, we just got indices
  return promise
    .then(indices => {
      return Bluebird
        .map(indices, index => _getValue(db, index));
    });
}

// indexOpts: { indexProp }
export function initializeIfNotSet (db, prefix, valueArray, indexOpts) {
  return Bluebird
    .each(valueArray, (value, index) => {
      return _getValue(db, value.id)
        .then(currentValue => {
          if (!isEqual(value, currentValue)) {
            return _setValue(db, value.id, Object.assign(value, { system: true }), indexOpts);
          }
        })
        .catch(() => { // Bluebird filter facility isn't working for errors.NotFoundError
          logger.info(`Initializing ${prefix}::${value.id}`);
          return _setValue(db, value.id, Object.assign(value, { system: true }), indexOpts);
        });
    });
}

function _findAndDeleteIndex (db, key, { indexProp }) {
  return _getValue(db, key)
    .then(value => {
      assert(typeof indexProp === 'function');
      const indexKey = `~INDEX~${indexProp(value)}`;

      return Bluebird
        .fromCallback(db.del.bind(db, indexKey, { sync: true }))
        .tap(() => logger.info('Index delete succeeded', indexKey));
    })
    .catch(() => {}); // suppress delete errors
}

// options: { indexProp: null }
export function deleteValue (db, key, options = {}) {
  return Bluebird
    .try(() => {
      if (options.indexProp) {
        return _findAndDeleteIndex(db, key, {
          indexProp: options.indexProp
        });
      }
    })
    .then(() => Bluebird.fromCallback(db.del.bind(db, key, { sync: true })))
    .tap(() => logger.info(' delete succeeded', key))
    .catch(() => {}); // suppress delete errors
}

export const setValue = _setValue;
export const getValue = _getValue;
