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

// Options: { indexProp: null, indexSub: null }
function _setValue (db, key, value, options = {}) {
  const values = [
    { key, value }
  ];
  if (options.indexProp && options.indexSub) {
    values.push({ key: `~INDEX~${value[options.indexProp]}-${key}`, value: key, prefix: options.indexSub });
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
  console.log(getOptions);
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
          return _setValue(db, value.id, Object.assign(value, { system: true, order: index }), indexOpts);
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
