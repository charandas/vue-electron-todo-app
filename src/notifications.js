import _notifier from 'node-notifier';
import moment from 'moment';
import each from 'lodash/each';

import getLogger from './logger/index';
import config from './config-lib/index';

const logger = getLogger({ label: 'notifications' });

let notifier;

if (process.platform === 'darwin') {
  notifier = new _notifier.NotificationCenter({
    withFallback: false
  });
} else {
  notifier = _notifier;
}

function _notify (message) {
  notifier.notify({
    'title': 'Jaya Kula Techeast',
    'message': message,
    'sound': false,
    'icon': 'Terminal Icon',
    'wait': true,
    actions: 'Yes',
    closeLabel: 'No',
    reply: false
  });
  logger.silly('Sent notification to confirm new session');
}

function schedule () {
  each(config.get('reminders'), reminder => {
    const millis = moment(reminder.sendAt, 'hmm').subtract(moment().valueOf(), 'ms');
    // logger.info('Millis from now', millis.valueOf());
    const humanized = moment.duration(millis.valueOf(), 'milliseconds').humanize();
    const msg = `"${reminder.title}" in ${humanized} from now`;
    logger.verbose(msg);
    _notify(`Scheduled ${msg}`);
    setTimeout(() => {
      _notify(reminder.title);
    }, millis);
  });
}

function confirmNewSession () {
  _notify('Start new checklist? Please confirm.');
  return notifier;
}

export default {
  confirmNewSession: confirmNewSession,
  schedule: schedule
};
