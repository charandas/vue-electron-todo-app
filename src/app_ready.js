import { app } from 'electron';
import jetpack from 'fs-jetpack';
import levelup from 'levelup';
import path from 'path';

import _getLogger from './logger/index';
import config from './config-lib/index';

const runningEnv = config.get('env');

const userDataPath = app.getPath('userData');
if (runningEnv !== 'production') {
  app.setPath('userData', `${userDataPath} ( ${runningEnv} )`);
}
const appPath = app.getPath('userData');
jetpack.dir(appPath);

export function getLogger (options = {}) {
  return _getLogger(Object.assign({}, options, { appPath }));
}
export var database = levelup(path.resolve(appPath, 'techeast_db'), {
  valueEncoding: 'json'
});
