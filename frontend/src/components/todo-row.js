import Vue from 'vue';
// import map from 'lodash/map';
import find from 'lodash/find';
import Bluebird from 'bluebird';

import './todo-row.css!css';
import todoRowTpl from './todo-row.html!vtc';
import MyDatePicker from './date-picker';
import rpcClient from '../utils/rpc-client';

const MyTodoRow = Vue.component('my-todo-row', {
  props: ['todo', 'config', 'removeTodo'],
  data () {
    return {
      reminder: find(this.config.reminders, { todoId: this.todo.id }) || { sendAt: null },
      editing: false,
      reminderPickModalResult: null
    };
  },
  components: {
    MyDatePicker
  },
  computed: {
    reminderMessaging: {
      get: function () {
        return this.reminder.sendAt ? 'Update reminder' : 'Add reminder';
      },
      set: function (newReminder) {
        this.reminder = newReminder;
      }
    }
  },
  methods: {
    addOrUpdateReminder: function () {
      const promise = new Bluebird((resolve) => {
        this.reminderPickModalResult = resolve;
      });
      promise
        .then(result => {
          this.reminderPickModalResult = null;
          if (result && result !== 'cancel') {
            this.loading = true;
            return rpcClient
            .addOrUpdateReminderAsync({
              todoId: this.todo.id,
              sendAt: result
            })
            .delay(1000)
            .then(savedReminder => (this.reminderMessaging = savedReminder));
          }
        })
        .finally(() => {
          this.loading = false;
          this.settingReminderForTodo = null;
        });
    },

    editTodo: function () {
      this.beforeEditCache = this.todo.title;
      this.editing = true;
    },

    doneEdit: function () {
      if (!this.editing) {
        return;
      }
      this.editing = false;
      this.todo.title = this.todo.title.trim();

      // ADD loading around this
      if (this.beforeEditCache !== this.todo.title) {
        this.$emit('edited', rpcClient.editTodoAsync({ title: this.todo.title, id: this.todo.id }));
      }

      if (!this.todo.title) {
        this.removeTodo(this.todo);
      }
    },

    cancelEdit: function () {
      this.editing = false;
      this.todo.title = this.beforeEditCache;
    }
  },
  render: todoRowTpl.render,
  staticRenderFns: todoRowTpl.staticRenderFns,
  // a custom directive to wait for the DOM to be updated
  // before focusing on the input field.
  // http://vuejs.org/guide/custom-directive.html
  directives: {
    'todo-focus': function (el, value) {
      if (value) {
        el.focus();
      }
    }
  }
});

export default MyTodoRow;
