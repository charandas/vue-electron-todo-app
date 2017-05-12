// NOTE: in this file, prefer checking for runningEnv === 'development'
// over runningEnv !== 'production'. In case, our config read fails,
// we never want to assume we are running in development, when we are in production

import path from 'path';
import url from 'url';
import { app, Menu } from 'electron';
import contextMenu from 'electron-context-menu';
import Server from 'electron-rpc/server';

import menubar from 'menubar';

import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import { mainMenuTemplate } from './menu/main_menu_template';

import _createWindow from './helpers/window';

import config from './config-lib/index';
import getLogger from './logger/index';
import notifications from './notifications';
import configureRoutes from './configure-routes';

global.techeastConfig = config;
global.notifications = notifications;

const logger = getLogger({});

const APP_PATH = 'frontend/index.html';
const MENUBAR_APP_DIR = 'frontend/menubar';
const runningEnv = config.get('env');

var LOAD_URL = path.join(__dirname, '..', '..', APP_PATH);
var MENUBAR_LOAD_DIR = path.join(__dirname, '..', '..', MENUBAR_APP_DIR);
if (runningEnv === 'development') {
  LOAD_URL = path.join(__dirname, '..', APP_PATH);
  MENUBAR_LOAD_DIR = path.join(__dirname, '..', MENUBAR_APP_DIR);
}

const server = new Server();
app.commandLine.appendSwitch('disable-pinch');

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
  configureRoutes(server);

  notifications.schedule(mainWindow);

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

let menuCanQuit = false;
const menu = menubar({
  dir: MENUBAR_LOAD_DIR,
  showDockIcon: false
});

function quitMenu () {
  menuCanQuit = true;
  menu.app.quit();
}

menu.on('ready', function ready () {
  menu.app.on('will-quit', function tryQuit (e) {
    if (menuCanQuit) {
      return true;
    }
    menu.window = undefined;
    e.preventDefault();
  });
});

process.on('uncaughtException', err => {
  logger.error('Uncaught exception:', err.message, err.stack || '');
  quitMenu();
});

app.on('window-all-closed', () => {
  quitMenu();
  app.quit();
});

app.on('ready', () => {
  let mainWindow = createWindow();

  mainWindow.on('closed', () => {
    quitMenu();
    mainWindow = undefined;
  });
});
