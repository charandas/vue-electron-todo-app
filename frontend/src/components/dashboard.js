import Vue from 'vue';
import VueSpinner from 'vue-spinner';
import find from 'lodash/find';

import { mapToTodos } from '../utils/todos';
import dashboardTpl from './dashboard.html!vtc';

import './styles.css!css';

// TODO: restore routing pre-router

const { remote, ipcRenderer } = System._nodeRequire('electron');
const notifications = remote.getGlobal('notifications');
const config = remote.getGlobal('techeastConfig');

// window.localStorage persistence
var STORAGE_KEY = 'todos-techeast';
var todoStorage = {
  fetch: function () {
    const todosTemplate = config.get('checklist:todosTemplate');
    const fromStorage = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    const todos = fromStorage || mapToTodos(todosTemplate);
    todoStorage.uid = todos.length;
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
  render: dashboardTpl.render,
  staticRenderFns: dashboardTpl.staticRenderFns,
  data: () => ({
    eventDate: new Date().toDateString(),
    loading: false,
    todos: todoStorage.fetch(),
    newTodo: '',
    editedTodo: null,
    visibility: 'all'
  }),
  components: {
    RiseLoader: VueSpinner.RiseLoader
  },
  created: function () {
    ipcRenderer.on('checkOffTodo', (event, todoId) => {
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
    startNewSession: function () {
      notifications.confirmNewSession();
      this.loading = true;
      ipcRenderer.once('confirmNewSession', (event, message) => {
        if (message === 'Yes') {
          this.todos = mapToTodos(config.get('checklist:todosTemplate'));
        }
        this.loading = false;
      });
    },
    addTodo: function () {
      var value = this.newTodo && this.newTodo.trim();
      if (!value) {
        return;
      }
      this.todos.push({
        id: todoStorage.uid++,
        title: value,
        completed: false
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
