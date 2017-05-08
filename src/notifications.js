import _notifier from 'node-notifier';
import moment from 'moment';
import each from 'lodash/each';

// Set by the schedule function
let mainWindow;

import getLogger from './logger/index';
import config from './config-lib/index';

const SNOOZE_5 = '5m';
const SNOOZE_2 = '2m';
const SNOOZE_1 = '1m';
const SNOOZE_5_MS = 300000;
const SNOOZE_2_MS = 120000;
const SNOOZE_1_MS = 60000;
const TIMEOUT_SECS = 15;

const logger = getLogger({ label: 'notifications' });

const notifier = new _notifier.NotificationCenter({
  withFallback: false
});

function _notify ({ message, reply = false, actions = 'Yes', closeLabel = 'No', channelName, retryFn, todoId }) {
  const settings = {
    'title': 'Tech Host Assistant',
    'message': message,
    'sound': false,
    'icon': 'Terminal Icon'
  };
  logger.silly('Sent notification to confirm new session');
  if (reply) {
    Object.assign(settings, {
      actions,
      closeLabel,
      reply,
      timeout: TIMEOUT_SECS
    });
  }

  logger.silly('Reply', settings);
  notifier.notify(settings, (err, response, metadata) => {
    if (err) {
      logger.silly(err);
      return;
    }
    if (reply) {
      logger.info(metadata);
      if (channelName === 'confirmNewSession') {
        mainWindow.webContents.send(channelName, metadata.activationValue);
      } else if (channelName === 'checkOffTodo') {
        if (metadata.activationValue === 'Done') {
          mainWindow.webContents.send(channelName, todoId);
        } else if (retryFn) {
          if (metadata.activationValue === SNOOZE_5) {
            setTimeout(retryFn, SNOOZE_5_MS);
          } else if (metadata.activationValue === SNOOZE_2) {
            setTimeout(retryFn, SNOOZE_2_MS);
          } else if (metadata.activationValue === SNOOZE_1) {
            setTimeout(retryFn, SNOOZE_1_MS);
          } else if (metadata.activationType === 'timeout') {
            // We timedout, remind in 1 minute
            setTimeout(retryFn, SNOOZE_1_MS);
          }
        }
      }
    }
  });
}

function scheduleReminder (reminder) {
  const millis = moment(reminder.sendAt, 'hmm').subtract(moment().valueOf(), 'ms');
  // const humanized = moment.duration(millis.valueOf(), 'milliseconds').humanize();
  if (millis.valueOf() < 0) {
    // _notify({ message: `Was to be done: "${reminder.title}" ${humanized} ago` });
  } else {
    logger.verbose(`Scheduled ${reminder.title}`);
    // _notify({ message: `Scheduled "${reminder.title}"  in ${humanized} from now` });
    setTimeout(() => {
      const args = {
        message: reminder.title,
        reply: true,
        dropdownLabel: 'Snooze',
        actions: [SNOOZE_5, SNOOZE_2, SNOOZE_1],
        closeLabel: 'Done',
        channelName: 'checkOffTodo',
        todoId: reminder.todoId
      };
      const retryFn = _notify.bind(null, args);
      _notify(Object.assign(args, { retryFn }));
    }, millis);
  }
}

function schedule (_mainWindow) {
  mainWindow = _mainWindow;
  each(config.get('reminders'), scheduleReminder);
}

function confirmNewSession () {
  _notify({ message: 'Start new checklist? Please confirm.', reply: true, channelName: 'confirmNewSession' });
  return notifier;
}

export default {
  confirmNewSession,
  scheduleReminder,
  schedule
};
