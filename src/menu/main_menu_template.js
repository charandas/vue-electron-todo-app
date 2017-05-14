import { app } from 'electron';

export var mainMenuTemplate = {
  label: 'Preferences',
  submenu: [
    {
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      click: function () {
        app.quit();
      }
    }
  ]
};
