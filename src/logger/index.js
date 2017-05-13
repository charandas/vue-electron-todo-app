import * as winston from 'winston';
import ElectronConsole from 'winston-electron';
import fs from 'fs';
import util from 'util';
import path from 'path';

import config from '../config-lib/index';
import clsNamespace from './cls-namespace';

let loggerInitialized = new Map();
let writeStream;

function translateMeta (meta) {
  const translated = util.inspect(meta, {
    depth: null,
    colors: true
  });
  return `\n${translated}`;
}

function formatter ({ level, label, timestamp, message, meta }) {
  return `[${level}] ${label}: ${timestamp()}: ${message || translateMeta(meta)}`;
}

function timestampWithCorrelation () {
  const ts = new Date().toISOString();
  const corrId = clsNamespace.get('id');
  if (corrId) {
    return `${ts} ${corrId}`;
  }
  return ts;
}

function getLogger ({ colorize = true, label = 'techeast', appPath }) {
  let logger = loggerInitialized.get(label);
  if (logger) {
    return logger;
  }

  const options = {
    colorize,
    label,
    level: config.get('LOG_LVL') || 'info',
    timestamp: timestampWithCorrelation
  };

  const transports = [
    new (ElectronConsole)(options)
  ];

  if (!writeStream) {
    // Shared writeStream between various loggers, even though they have separate objects per label
    const filename = path.resolve(appPath, 'log');
    writeStream = fs.createWriteStream(filename, { flags: 'a' });
  }
  Object.assign(options, {
    stream: writeStream,
    json: false,
    formatter
  });
  transports.push(new (winston.transports.File)(options));

  logger = new (winston.Logger)({
    transports
  });
  loggerInitialized.set(label, logger);

  return logger;
}

export default getLogger;
