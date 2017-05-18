import Vue from 'vue';
import find from 'lodash/find';
import Bluebird from 'bluebird';

import './todo-row.css!css';
import todoRowTpl from './todo-row.html!vtc';
import MyDatePicker from './date-picker';
import rpcClient from '../utils/rpc-client';

function resetReminderInVM () {
  return { sendAt: null };
}

const MyTodoRow = Vue.component('my-todo-row', {
  props: ['todo', 'config', 'removeTodo'],
  data () {
    return {
      reminder: find(this.config.reminders, { todoId: this.todo.id }) || resetReminderInVM(),
      editing: false,
      reminderPickModalResult: null
    };
  },
  components: {
    MyDatePicker
  },
  computed: {
    reminderMessaging: function () {
      return this.reminder.sendAt ? 'Update reminder' : 'Add reminder';
    }
  },
  methods: {
    // Adds, removes, updates, or leaves untouched depending on modal result promise
    updateReminder: function () {
      const promise = new Bluebird((resolve) => {
        this.reminderPickModalResult = resolve;
      });
      promise
        .then(result => {
          this.reminderPickModalResult = null;
          if (result === 'cancel') {
            // do nothing
          } else if (result === 'remove') {
            return rpcClient
              .removeReminderAsync({
                todoId: this.todo.id
              })
              .tap(savedReminder => (this.reminder = resetReminderInVM()));
          } else if (result) {
            return rpcClient
            .addOrUpdateReminderAsync({
              todoId: this.todo.id,
              sendAt: result
            })
            .tap(savedReminder => (this.reminder = savedReminder));
          }
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
        this.$emit('edited', rpcClient.addOrUpdateTodoAsync({ title: this.todo.title, id: this.todo.id }));
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
