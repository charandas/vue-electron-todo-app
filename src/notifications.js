import _notifier from 'node-notifier';
import moment from 'moment';
import each from 'lodash/each';
import remove from 'lodash/remove';
// import map from 'lodash/map';
import uuid from 'node-uuid';

// Set by the schedule function
let mainWindow;

import getLogger from './logger/index';
import config from './config-lib/index';

const SNOOZE_5 = '5m';
const SNOOZE_2 = '2m';
const SNOOZE_1 = '1m';
const TIMEOUT_SECS = 15;

const snoozeMap = new Map();
snoozeMap.set(SNOOZE_5, 300000);
snoozeMap.set(SNOOZE_2, 120000);
snoozeMap.set(SNOOZE_1, 60000);

const logger = getLogger({ label: 'notifications' });
const snoozed = [];
global.snoozed = snoozed;

function addToSnoozed (notification) {
  remove(snoozed, { notificationId: notification.notificationId });
  // this updates the humanized future time in case of a resnooze
  snoozed.push(notification);
}

function removeFromSnoozed (notificationId) {
  remove(snoozed, { notificationId });
}

const notifier = new _notifier.NotificationCenter({
  withFallback: false
});

function _notify ({ message, reply = false, actions = 'Yes', closeLabel = 'No', dropdownLabel, channelName, retryFn, todoId, notificationId }) {
  // ['message', 'futureTime', 'todoId', 'notificationId']
  const options = arguments[0];
  console.log(options);
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
      dropdownLabel,
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
          if (notificationId) {
            removeFromSnoozed(notificationId);
          }
          mainWindow.webContents.send(channelName, todoId);
        } else if (retryFn) {
          let snoozedMs;
          if ((snoozedMs = snoozeMap.get(metadata.activationValue))) {
            addToSnoozed(Object.assign(options, {
              futureTime: moment().add(snoozedMs, 'milliseconds')
            }));
            setTimeout(retryFn, snoozedMs);
          } else if (metadata.activationType === 'timeout') {
            snoozedMs = snoozeMap.get(SNOOZE_1);
            // We timedout, remind in 1 minute
            addToSnoozed(Object.assign(options, {
              futureTime: moment().add(snoozedMs, 'milliseconds')
            }));
            setTimeout(retryFn, snoozedMs);
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
        todoId: reminder.todoId,
        notificationId: uuid.v4()
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

export default {
  scheduleReminder,
  schedule
};
