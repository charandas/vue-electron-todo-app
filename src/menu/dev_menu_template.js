import { BrowserWindow } from 'electron';

export var devMenuTemplate = {
  label: 'Development',
  submenu: [{
    label: 'Reload',
    accelerator: 'CmdOrCtrl+R',
    click: function () {
      BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
    }
  }, {
    label: 'Toggle DevTools',
    accelerator: 'Alt+CmdOrCtrl+I',
    click: function () {
      BrowserWindow.getFocusedWindow().toggleDevTools();
    }
  }]
};
