import * as winston from 'winston';
import ElectronConsole from 'winston-electron';
import path from 'path';

import config from '../config-lib/index';
import clsNamespace from './cls-namespace';

let loggerInitialized = false;

function timestampWithCorrelation () {
  const ts = new Date().toISOString();
  const corrId = clsNamespace.get('id');
  if (corrId) {
    return `${ts} ${corrId}`;
  }
  return ts;
}

function getLogger ({ colorize = true, label = 'techeast', appPath }) {
  if (loggerInitialized) {
    return loggerInitialized;
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

  if (appPath) {
    transports.push(new (winston.transports.File)(Object.assign(options, { filename: path.resolve(appPath, 'log'), maxsize: 102400 })));
  }

  loggerInitialized = new (winston.Logger)({
    transports
  });

  return loggerInitialized;
}

export default getLogger;
