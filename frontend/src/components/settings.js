import Vue from 'vue';
import VueFormly from 'vue-formly';
import VueFormlyBootstrap from 'vue-formly-bootstrap';
import map from 'lodash/map';
// import find from 'lodash/find';
import get from 'lodash/get';
import VueSpinner from 'vue-spinner';

import settingsTpl from './settings.html!vtc';

import { getConfig, addReminder } from '../utils/rpc-client';

Vue.use(VueFormly.default);
Vue.use(VueFormlyBootstrap.default);

function todoOptions (config) {
  return map(get(config, 'checklist.todosTemplate'), todo => ({
    label: todo.title,
    value: todo.id
  }));
}

const MySettings = Vue.component('my-settings', {
  render: settingsTpl.render,
  staticRenderFns: settingsTpl.staticRenderFns,
  components: {
    RiseLoader: VueSpinner.RiseLoader
  },
  methods: {
    addReminder: function () {
      // TODO: Add loading around this
      console.log(this.model);
      addReminder(this.model, (err, reminders) => {
        console.log(err);
        console.log('Updated list', reminders);
      });
    },
    setConfig: function (err, config) {
      if (err) {
        this.error = err.toString();
      } else {
        this.config = config;
        this.fields.push({
          key: 'todoId',
          type: 'select',
          options: todoOptions(this.config),
          templateOptions: {
            label: 'TODO to checkoff'
          }
        });
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    getConfig((err, config) => {
      next(vm => vm.setConfig(err, config));
    });
  },
  data: () => ({
    config: null,
    error: null,
    form: {},
    model: {
      todoId: '',
      sendAt: ''
    }, // getReminder(this.$route.params.id),
    fields: [
      {
        key: 'sendAt',
        type: 'input',
        templateOptions: {
          label: 'Notify at',
          atts: {
            placeholder: 'Time in hours. Ex: 1835'
          }
        }
      }
    ]
  })
});

export default MySettings;
