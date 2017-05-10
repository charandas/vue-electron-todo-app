import Vue from 'vue';
import VueSpinner from 'vue-spinner';
import VueFormly from 'vue-formly';
import VueFormlyBootstrap from 'vue-formly-bootstrap';
import map from 'lodash/map';
import find from 'lodash/find';

import settingsTpl from './settings.html!vtc';

const { remote } = System._nodeRequire('electron');
const config = remote.getGlobal('techeastConfig');

Vue.use(VueFormly.default);
Vue.use(VueFormlyBootstrap.default);

function todoOptions () {
  return map(config.get('checklist:todosTemplate'), todo => ({
    label: todo.title,
    value: todo.id
  }));
}

function getReminder (id) {
  return find(config.get('checklist:reminders'), { id });
}

const MySettings = Vue.component('my-settings', {
  render: settingsTpl.render,
  staticRenderFns: settingsTpl.staticRenderFns,
  components: {
    RiseLoader: VueSpinner.RiseLoader
  },
  methods: {
    doSomething: function () {}
  },
  data: () => ({
    form: {},
    model: {
      title: '',
      todoId: '',
      sendAt: ''
    }, // getReminder(this.$route.params.id),
    fields: [
      {
        key: 'title',
        type: 'input',
        templateOptions: {
          label: 'Remind about',
          atts: {
            placeholder: 'Ex: Start/Stop recording'
          }
        }
      },
      {
        key: 'todoId',
        type: 'select',
        options: todoOptions(),
        templateOptions: {
          label: 'TODO to checkoff'
        }
      },
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
