import _notifier from 'node-notifier';
import moment from 'moment';
import each from 'lodash/each';

// Set by the schedule function
let mainWindow;

import getLogger from './logger/index';
import config from './config-lib/index';

const logger = getLogger({ label: 'notifications' });

const notifier = new _notifier.NotificationCenter({
  withFallback: false
});

function _notify ({ message, reply = false }) {
  const settings = {
    'title': 'Tech Host Assistant',
    'message': message,
    'sound': false,
    'icon': 'Terminal Icon'
  };
  logger.silly('Sent notification to confirm new session');
  if (reply) {
    Object.assign(settings, {
      actions: 'Yes',
      closeLabel: 'No',
      reply: reply,
      timeout: 25
    });
  }
  notifier.notify(settings, (err, response, metadata) => {
    if (err) throw err;
    if (reply) {
      logger.info(metadata);
      mainWindow.webContents.send('confirmNewSession', metadata.activationValue);
    }
  });
}

function schedule (_mainWindow) {
  mainWindow = _mainWindow;
  each(config.get('reminders'), reminder => {
    const millis = moment(reminder.sendAt, 'hmm').subtract(moment().valueOf(), 'ms');
    const humanized = moment.duration(millis.valueOf(), 'milliseconds').humanize();
    if (millis.valueOf() < 0) {
      _notify({ message: `Was to be done: "${reminder.title}" ${humanized} ago` });
    } else {
      logger.verbose(`Scheduled ${reminder.title}`);
      _notify({ message: `Scheduled "${reminder.title}"  in ${humanized} from now` });
      setTimeout(() => {
        _notify({ message: reminder.title });
      }, millis);
    }
  });
}

function confirmNewSession () {
  _notify({ message: 'Start new checklist? Please confirm.', reply: true });
  return notifier;
}

export default {
  confirmNewSession: confirmNewSession,
  schedule: schedule
};
