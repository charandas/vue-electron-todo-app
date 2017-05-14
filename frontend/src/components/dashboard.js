import Vue from 'vue';
import VueClockPicker from 'vue-clock-picker';
import VueSpinner from 'vue-spinner';
import find from 'lodash/find';
import get from 'lodash/get';
import Bluebird from 'bluebird';

import {
  getConfig,
  addTodo as addTodoRpc,
  addReminder as addReminderRpc
} from '../utils/rpc-client';
import { mapToTodos } from '../utils/todos';
import dashboardTpl from './dashboard.html!vtc';

import MyModal from './modal';

import './styles.css!css';

// TODO: restore routing pre-router

const { ipcRenderer } = System._nodeRequire('electron');

// window.localStorage persistence
var STORAGE_KEY = 'todos-techeast';
var todoStorage = {
  fetch: function (todosTemplate) {
    const fromStorage = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    const todos = fromStorage || mapToTodos(todosTemplate);
    return todos;
  },
  save: function (todos) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }
};

// visibility filters
var filters = {
  all: function (todos) {
    return todos;
  },
  active: function (todos) {
    return todos.filter(function (todo) {
      return !todo.completed;
    });
  },
  completed: function (todos) {
    return todos.filter(function (todo) {
      return todo.completed;
    });
  }
};

const MyDashboard = Vue.component('my-dashboard', {
  props: ['visibility'],
  render: dashboardTpl.render,
  staticRenderFns: dashboardTpl.staticRenderFns,
  data () {
    return {
      defaultHour: new Date().getHours(),
      defaultMinute: new Date().getMinutes(),
      todos: [],
      error: null,
      eventDate: new Date().toDateString(),
      loading: false,
      newTodo: '',
      editedTodo: null,
      newSessionModalResult: null,
      reminderPickModalResult: null
    };
  },
  components: {
    RiseLoader: VueSpinner.RiseLoader,
    MyModal,
    VueClockPicker: VueClockPicker.default
  },
  beforeRouteEnter (to, from, next) {
    getConfig((err, config) => {
      next(vm => vm.setConfig(err, config));
    });
  },
  created: function () {
    ipcRenderer.on('checkOffTodo', (event, todoId) => {
      console.log(todoId);
      if (todoId) {
        const found = find(this.todos, { id: todoId });
        if (found) {
          found.completed = true;
        }
      }
    });
  },

  // watch todos change for window.localStorage persistence
  watch: {
    todos: {
      handler: function (todos) {
        todoStorage.save(todos);
      },
      deep: true
    }
  },

  // computed properties
  // http://vuejs.org/guide/computed.html
  computed: {
    filteredTodos: function () {
      return filters[this.visibility](this.todos);
    },
    remaining: function () {
      return filters.active(this.todos).length;
    },
    allDone: {
      get: function () {
        return this.remaining === 0;
      },
      set: function (value) {
        this.todos.forEach(function (todo) {
          todo.completed = value;
        });
      }
    }
  },

  filters: {
    pluralize: function (n) {
      return n === 1 ? 'item' : 'items';
    }
  },

  // methods that implement data logic.
  // note there's no DOM manipulation here at all.
  methods: {
    timeChangeHandler: function () {
      console.log(arguments);
    },
    setConfig: function (err, config) {
      if (err) {
        this.error = err.toString();
      } else {
        this.config = config;
        this.todos = todoStorage.fetch(get(this.config, 'todos'));
      }
    },
    startNewSession: function () {
      const promise = new Bluebird((resolve) => {
        this.newSessionModalResult = resolve;
      });
      promise
        .then(result => {
          this.newSessionModalResult = null;
          if (result === 'ok') {
            this.loading = true;
            setTimeout(() => {
              this.todos = mapToTodos(get(this.config, 'todos'));
              this.loading = false;
            }, 1000);
          }
        });
    },
    updateReminder: function (todo) {
      const promise = new Bluebird((resolve) => {
        this.reminderPickModalResult = resolve;
      });
      promise
        .then(result => {
          this.reminderPickModalResult = null;
          if (result === 'ok') {
            addReminderRpc({
              todoId: todo.id,
              sendAt: 1632
            });
          }
        });
    },
    addTodo: function () {
      var value = this.newTodo && this.newTodo.trim();
      if (!value) {
        return;
      }
      addTodoRpc({ title: value }, (err, result) => {
        if (!err) {
          this.todos.push({
            id: result.id,
            title: value,
            completed: false
          });
        }
      });
      this.newTodo = '';
    },

    removeTodo: function (todo) {
      this.todos.splice(this.todos.indexOf(todo), 1);
    },

    editTodo: function (todo) {
      this.beforeEditCache = todo.title;
      this.editedTodo = todo;
    },

    doneEdit: function (todo) {
      if (!this.editedTodo) {
        return;
      }
      this.editedTodo = null;
      todo.title = todo.title.trim();
      if (!todo.title) {
        this.removeTodo(todo);
      }
    },

    cancelEdit: function (todo) {
      this.editedTodo = null;
      todo.title = this.beforeEditCache;
    },

    removeCompleted: function () {
      this.todos = filters.active(this.todos);
    }
  },

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

export default MyDashboard;
