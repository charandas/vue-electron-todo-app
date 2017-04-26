// NOTE: in this file, prefer checking for runningEnv === 'development'
// over runningEnv !== 'production'. In case, our config read fails,
// we never want to assume we are running in development, when we are in production

import path from 'path';
import url from 'url';
import { app, Menu } from 'electron';
import _ from 'lodash';

import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import createWindow from './helpers/window';
import contextMenu from 'electron-context-menu';

import config from './config-lib/index';
import getLogger from './logger/index';
import notifications from './notifications';

global.techeastConfig = config;
global.notifications = notifications;

const logger = getLogger({ appPath: app.getPath('userData') });

const APP_PATH = config.get('app_path') || 'app/index.html';
const runningEnv = config.get('env');

logger.info(`Running as ${runningEnv} environment`);

notifications.schedule();

function setApplicationMenu () {
  const menus = [editMenuTemplate, devMenuTemplate];
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
}

function appReboot (urlToNavigate) {
  return _.startsWith(urlToNavigate, LOAD_URL);
}

let LOAD_URL = path.join(__dirname, '..', '..', APP_PATH);
if (runningEnv === 'development') {
  LOAD_URL = path.join(__dirname, '..', APP_PATH);

  const userDataPath = app.getPath('userData');
  app.setPath('userData', `${userDataPath} ( ${runningEnv} )`);
}
app.commandLine.appendSwitch('disable-pinch');

if (runningEnv === 'development') {
  contextMenu({
    // For prepend: browserWindow second param when needed
    prepend: params => [{
      label: 'Context Menu',
      // only show it when right-clicking images
      visible: params.mediaType === 'image'
    }]
  });
}

app.on('ready', () => {
  if (runningEnv === 'development') {
    setApplicationMenu();
  }

  const mainWindow = createWindow('main', {
    width: 1080,
    height: 1920,
    webPreferences: {
      plugins: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: LOAD_URL,
    protocol: 'file:',
    slashes: true
  }));

  if (runningEnv === 'development') {
    mainWindow.openDevTools();
  } else {
    mainWindow.setFullScreen(true);
  }

  // NOTE:  (event, url) are the supported args for event callbacks
  // fetch web contents and disable navigation to outside the app.
  mainWindow.webContents.on('will-navigate', (event, urlToNavigate) => {
    if (appReboot(urlToNavigate)) {
      return false;
    }
    logger.info(`Prevented navigation away from app: ${urlToNavigate}`);
    event.preventDefault();
  });

  mainWindow.webContents.on('new-window', (event, urlOfNewWindow) => {
    logger.info(`Prevented new window from opening: ${urlOfNewWindow}`);
    event.preventDefault();
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
