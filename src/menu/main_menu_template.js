import { ipcMain, Menu, app } from 'electron';
import notifications from '../notifications';

function customReminderClick (_, browserWindow) {
  ipcMain.on('customReminderCreate', (event, arg) => {
    notifications.scheduleReminder();
    event.sender.send('customReminderCreated');
  });
}

function newSessionClick (_, browserWindow) {
  const menu = new Menu();
  menu.popup(browserWindow);
}

export var mainMenuTemplate = {
  label: 'Preferences',
  submenu: [
    { label: 'New Session', click: newSessionClick },
    { type: 'separator' },
    { label: 'Custom Reminder', click: customReminderClick },
    { label: 'My Reminders', click: void 0 },
    { type: 'separator' },
    {
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      click: function () {
        app.quit();
      }
    }
  ]
};
