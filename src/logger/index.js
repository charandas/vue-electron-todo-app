import * as winston from 'winston';
import ElectronConsole from 'winston-electron';
import fs from 'fs';
import util from 'util';
import { app } from 'electron';
import path from 'path';
import jetpack from 'fs-jetpack';

import config from '../config-lib/index';
import clsNamespace from './cls-namespace';

const userDataPath = app.getPath('userData');
const runningEnv = config.get('env');
if (runningEnv !== 'production') {
  app.setPath('userData', `${userDataPath} ( ${runningEnv} )`);
}
jetpack.dir(app.getPath('userData'));

let loggerInitialized = new Map();
const filename = path.resolve(app.getPath('userData'), 'log');
const writeStream = fs.createWriteStream(filename, { flags: 'a' });

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

function getLogger ({ colorize = true, label = 'techeast' }) {
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

  // Shared writeStream between various loggers, even though they have separate objects per label
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
