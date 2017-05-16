import Vue from 'vue';
import VueClockPicker from 'vue-clock-picker';
import padStart from 'lodash/padStart';
import get from 'lodash/get';
import isNull from 'lodash/isNull';

import MyModal from './modal';
import datePickerTpl from './date-picker.html!vtc';

const MyDatePicker = Vue.component('my-date-picker', {
  props: ['result', 'todo', 'reminder'],
  data () {
    return {
      settingReminderTime: null
    };
  },
  computed: {
    defaultHour: function () {
      if (isNull(get(this.reminder, 'sendAt'))) {
        return '12';
      }
      return this.reminder.sendAt.toString().slice(0, 2);
    },
    defaultMinute: function () {
      if (isNull(get(this.reminder, 'sendAt'))) {
        return '0';
      }
      return this.reminder.sendAt.toString().slice(2, 4);
    }
  },
  components: {
    VueClockPicker: VueClockPicker.default,
    MyModal
  },
  methods: {
    timeChangeHandler: function (time) {
      const hours = padStart(time.hour, 2, '0');
      const minutes = padStart(time.minute, 2, '0');
      // TODO: eradicate extra zeroes on the way back
      this.settingReminderTime = `${hours}${minutes}`;
    }
  },
  render: datePickerTpl.render,
  staticRenderFns: datePickerTpl.staticRenderFns
});

export default MyDatePicker;
