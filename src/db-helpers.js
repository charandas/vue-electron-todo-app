import Bluebird from 'bluebird';

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
        logger.error(err);
        reject(err);
      }

      resolve(value);
    });
  });
}

// Options: { indexProp: null, indexSub: null }
// typeof options.indexProp === 'function' must satisfy
export function setValueAfterLookupIndex (db, value, options = {}) {
  const indexKey = `~INDEX~${options.indexProp(value)}`;
  return _getValue(options.indexSub, indexKey)
    .then(index => _setValue(db, index, value));
}

// Options: { indexProp: null, indexSub: null }
function _setValue (db, key, value, options = {}) {
  const values = [
    { key, value }
  ];
  if (options.indexProp && options.indexSub) {
    if (typeof options.indexProp === 'function') {
      values.push({ key: `~INDEX~${options.indexProp(value)}`, value: key, prefix: options.indexSub });
    } else {
      values.push({ key: `~INDEX~${value[options.indexProp]}-${key}`, value: key, prefix: options.indexSub });
    }
  }
  return new Bluebird((resolve, reject) => {
    db.batch(values, function (err) {
      if (err) {
        logger.error(err);
        reject(err);
      }

      resolve(true);
    });
  });
}

// Options: { indexPropValue: null, indexSub: null }
export function getValues (db, options = {}) {
  const getOptions = {};
  if (options.indexPropValue && options.indexSub) {
    Object.assign(getOptions, {
      gte: `~INDEX~${options.indexPropValue}`,
      lte: `~INDEX~${options.indexPropValue}~`
    });
  }
  const values = [];
  const promise = new Bluebird((resolve, reject) => {
    (options.indexSub || db).createValueStream(getOptions)
    .on('data', function (data) {
      values.push(data);
    })
    .on('end', () => resolve(values))
    .on('error', reject);
  });

  if (!options.indexSub) {
    return promise;
  }

  // Otherwise, we just got indices
  return promise
    .then(indices => {
      return Bluebird
        .map(indices, index => _getValue(db, index));
    });
}

// indexOpts: { indexProp, indexSub }
export function initializeIfNotSet (db, prefix, valueArray, indexOpts) {
  return Bluebird
    .each(valueArray, (value, index) => {
      return _getValue(db, value.id)
        .catch(() => { // Bluebird filter facility isn't working for errors.NotFoundError
          logger.info(`Initializing ${prefix}::${value.id}`);
          return _setValue(db, value.id, Object.assign(value, { system: true }), indexOpts);
        });
    });
}

function _findAndDeleteIndex (db, key, { indexProp, indexSub }) {
  return _getValue(db, key)
    .then(value => {
      const indexKey = typeof indexProp === 'function'
       ? `${indexProp(value)}`
       : `${value[indexProp]}-${key}`;
      return Bluebird.fromCallback(indexSub.del.bind(indexSub, indexKey, { sync: true }));
    })
    .tap(() => logger.info('Index delete succeeded', key, indexProp, indexSub))
    .catch(() => {}); // suppress delete errors
}

// options: { indexProp: null, indexSub: null }
export function deleteValue (db, key, options = {}) {
  return Bluebird
    .try(() => {
      if (options.indexProp && options.indexSub) {
        return _findAndDeleteIndex(db, key, {
          indexProp: options.indexProp,
          indexSub: options.indexSub
        });
      }
    })
    .then(() => Bluebird.fromCallback(db.del.bind(db, key, { sync: true })))
    .tap(() => logger.info(' delete succeeded', key, options))
    .catch(() => {}); // suppress delete errors
}

export const setValue = _setValue;
export const getValue = _getValue;
