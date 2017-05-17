import _notifier from 'node-notifier';
import moment from 'moment';
import each from 'lodash/each';
import remove from 'lodash/remove';
import find from 'lodash/find';

// Set by the schedule function
let mainWindow;

import { getLogger, database as db } from './app_ready';
import { getValue, getValues } from './db-helpers';

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

const todosTable = db.sublevel('todos');
const remindersTable = db.sublevel('reminders');

function unscheduleNotification (notification) {
  const removed = remove(scheduled, { todoId: notification.todoId });
  if (removed.length && removed[0].timeoutID) {
    clearTimeout(removed[0].timeoutID);
  }
}

function addToScheduled (notification) {
  unscheduleNotification(notification);

  // this updates the humanized future time in case of a resnooze
  scheduled.push({
    futureTime: notification.futureTime,
    todoId: notification.todoId,
    message: notification.message,
    timeoutID: notification.timeoutID
  });
}

// assumes the caller calls this after the timeout occurs
function removeFromScheduled (todoId) {
  remove(scheduled, { todoId });
}

const notifier = new _notifier.NotificationCenter({
  withFallback: false
});

function _notify ({ message, reply = false, actions = 'Yes', closeLabel = 'No', dropdownLabel, channelName, retryFn, todoId }) {
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
          removeFromScheduled(todoId);
          mainWindow.webContents.send(channelName, todoId);
        } else if (retryFn) {
          let snoozedMs;
          if ((snoozedMs = snoozeMap.get(metadata.activationValue))) {
            addToScheduled(Object.assign(options, {
              futureTime: moment().add(snoozedMs, 'milliseconds').format(),
              timeoutID: setTimeout(retryFn, snoozedMs)
            }));
          } else if (metadata.activationType === 'timeout') {
            // Push the notification again
            retryFn();
          }
        }
      }
    }
  });
}

function scheduleNotification (reminder, message) {
  const millis = moment(reminder.sendAt, 'hmm').subtract(moment().valueOf(), 'ms');
  const args = {
    message,
    reply: true,
    dropdownLabel: 'Snooze',
    actions: [SNOOZE_5, SNOOZE_2, SNOOZE_1],
    closeLabel: 'Done',
    channelName: 'checkOffTodo',
    todoId: reminder.todoId
  };
  // const humanized = moment.duration(millis.valueOf(), 'milliseconds').humanize();
  if (millis.valueOf() > 0) { // this is, its in the future
    logger.verbose(`Scheduled ${reminder.title}`);
    // _notify({ message: `Scheduled "${reminder.title}"  in ${humanized} from now` });
    addToScheduled(Object.assign(args, {
      futureTime: moment(reminder.sendAt, 'hmm').format(),
      timeoutID: setTimeout(() => {
        const retryFn = _notify.bind(null, args);
        logger.info(args.message);
        _notify(Object.assign(args, { retryFn }));
        removeFromScheduled(reminder.todoId);
      }, millis)
    }));
  }
}

export function scheduleReminder (reminder) {
  return getValue(todosTable, reminder.todoId)
    .then(found => {
      if (found) {
        scheduleNotification(reminder, found.title);
      } else {
        logger.info('Refusing to schedule reminder for unfound todo', reminder.todoId);
      }
    });
}

export function unscheduleReminder (todo) {
  const notification = find(scheduled, { todoId: todo.id });
  if (notification) {
    unscheduleNotification(notification);
  }
}

export function scheduleAllReminders (_mainWindow) {
  mainWindow = _mainWindow;
  getValues(remindersTable)
    .then(reminders => {
      each(reminders, scheduleReminder);
    });
}

export const allScheduled = scheduled;
