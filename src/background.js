// NOTE: in this file, prefer checking for runningEnv === 'development'
// over runningEnv !== 'production'. In case, our config read fails,
// we never want to assume we are running in development, when we are in production

import path from 'path';
import url from 'url';
import { app, Menu } from 'electron';

import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import { mainMenuTemplate } from './menu/main_menu_template';

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

function setApplicationMenu () {
  let menus = [ mainMenuTemplate ];
  if (runningEnv === 'development') {
    menus = menus.concat([editMenuTemplate, devMenuTemplate]);
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
}

let LOAD_URL = path.join(__dirname, '..', '..', APP_PATH);
if (runningEnv === 'development') {
  LOAD_URL = path.join(__dirname, '..', APP_PATH);

  const userDataPath = app.getPath('userData');
  if (runningEnv !== 'production') {
    app.setPath('userData', `${userDataPath} ( ${runningEnv} )`);
  } else {
    app.setPath('userData', userDataPath);
  }
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

let mainWindow;

if (runningEnv !== 'development') {
  app.setLoginItemSettings({
    openAtLogin: true
  });
}

app.on('ready', () => {
  setApplicationMenu();
  mainWindow = createWindow('main', {
    width: config.get('width'),
    height: config.get('height'),
    webPreferences: {
      plugins: true
    }
  });

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
});

app.on('window-all-closed', () => {
  app.quit();
});
