import _notifier from 'node-notifier';
import moment from 'moment';
import each from 'lodash/each';
import remove from 'lodash/remove';
import find from 'lodash/find';

import uuidV4 from 'uuid/v4';

// Set by the schedule function
let mainWindow;

import { getLogger, database as db } from './app_ready';
import config from './config-lib/index';
import { getValue } from './db-helpers';

const SNOOZE_5 = '5m';
const SNOOZE_2 = '2m';
const SNOOZE_1 = '1m';
const TIMEOUT_SECS = 15;

const snoozeMap = new Map();
snoozeMap.set(SNOOZE_5, 300000);
snoozeMap.set(SNOOZE_2, 120000);
snoozeMap.set(SNOOZE_1, 60000);

const logger = getLogger({ label: 'notifications' });
const scheduled = [];

function addToScheduled (notification) {
  remove(scheduled, { notificationId: notification.notificationId });
  // this updates the humanized future time in case of a resnooze
  scheduled.push(notification);
}

function removeFromScheduled (notificationId) {
  remove(scheduled, { notificationId });
}

const notifier = new _notifier.NotificationCenter({
  withFallback: false
});

function _notify ({ message, reply = false, actions = 'Yes', closeLabel = 'No', dropdownLabel, channelName, retryFn, todoId, notificationId }) {
  // ['message', 'futureTime', 'todoId', 'notificationId']
  const options = arguments[0];
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
            removeFromScheduled(notificationId);
          }
          mainWindow.webContents.send(channelName, todoId);
        } else if (retryFn) {
          let snoozedMs;
          if ((snoozedMs = snoozeMap.get(metadata.activationValue))) {
            addToScheduled(Object.assign(options, {
              futureTime: moment().add(snoozedMs, 'milliseconds')
            }));
            setTimeout(retryFn, snoozedMs);
          } else if (metadata.activationType === 'timeout') {
            snoozedMs = snoozeMap.get(SNOOZE_1);
            // We timedout, remind in 1 minute
            addToScheduled(Object.assign(options, {
              futureTime: moment().add(snoozedMs, 'milliseconds')
            }));
            setTimeout(retryFn, snoozedMs);
          }
        }
      }
    }
  });
}

function scheduleNotification (reminder, message) {
  const millis = moment(reminder.sendAt, 'hmm').subtract(moment().valueOf(), 'ms');
  const notificationId = uuidV4();
  const args = {
    message,
    reply: true,
    dropdownLabel: 'Snooze',
    actions: [SNOOZE_5, SNOOZE_2, SNOOZE_1],
    closeLabel: 'Done',
    channelName: 'checkOffTodo',
    todoId: reminder.todoId,
    notificationId
  };
  // const humanized = moment.duration(millis.valueOf(), 'milliseconds').humanize();
  if (millis.valueOf() < 0) {
    // TODO: We are late, lets just notify right away, without retry
    // Its displaying only the first late notification
    // _notify(args);
  } else {
    logger.verbose(`Scheduled ${reminder.title}`);
    // _notify({ message: `Scheduled "${reminder.title}"  in ${humanized} from now` });
    addToScheduled(Object.assign(args, {
      futureTime: moment().add(millis.milliseconds(), 'milliseconds')
    }));
    setTimeout(() => {
      const retryFn = _notify.bind(null, args);
      _notify(Object.assign(args, { retryFn }));
      removeFromScheduled(notificationId);
    }, millis);
  }
}

export function scheduleReminder (reminder) {
  getValue(db, 'checklist')
    .then(checklist => {
      const found = find(checklist.todosTemplate, { id: reminder.todoId });
      if (found) {
        scheduleNotification(reminder, found.title);
      } else {
        logger.info('Refusing to schedule reminder for unfound todo', reminder.todoId);
      }
    });
}

export function scheduleAllReminders (_mainWindow) {
  mainWindow = _mainWindow;
  each(config.get('reminders'), scheduleReminder);
}

export const allScheduled = scheduled;
