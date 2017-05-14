// NOTE: in this file, prefer checking for runningEnv === 'development'
// over runningEnv !== 'production'. In case, our config read fails,
// we never want to assume we are running in development, when we are in production

import path from 'path';
import url from 'url';
import { app, Menu } from 'electron';
import contextMenu from 'electron-context-menu';
import Server from 'electron-rpc/server';

import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import { mainMenuTemplate } from './menu/main_menu_template';

import _createWindow from './helpers/window';

import config from './config-lib/index';
import { scheduleAllReminders } from './notifications';
import routes from './routes';
import { getLogger } from './app_ready';

const APP_PATH = 'frontend/index.html';
const runningEnv = config.get('env');

var LOAD_URL = path.join(__dirname, '..', '..', APP_PATH);
if (runningEnv === 'development') {
  LOAD_URL = path.join(__dirname, '..', APP_PATH);
}

const server = new Server();
app.commandLine.appendSwitch('disable-pinch');

const logger = getLogger();
logger.info(`Running as ${runningEnv} environment`);

function setApplicationMenu () {
  let menus = [ mainMenuTemplate ];
  if (runningEnv === 'development') {
    menus = menus.concat([editMenuTemplate, devMenuTemplate]);
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
}

function createWindow () {
  setApplicationMenu();
  const mainWindow = _createWindow('main', {
    width: config.get('width'),
    height: config.get('height'),
    webPreferences: {
      plugins: true
    }
  });

  server.configure(mainWindow.webContents);
  routes.configure(server);

  scheduleAllReminders(mainWindow);

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: LOAD_URL,
    protocol: 'file:',
    slashes: true
  }));

  if (runningEnv === 'development') {
    mainWindow.openDevTools();
  }
  return mainWindow;
}

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

if (runningEnv !== 'development') {
  app.setLoginItemSettings({
    openAtLogin: true
  });
}

process.on('uncaughtException', err => {
  logger.error('Uncaught exception:', err.message, err.stack || '');
  app.quit();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', () => {
  let mainWindow = createWindow();

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
});
