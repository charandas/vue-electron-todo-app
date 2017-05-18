import Vue from 'vue';
import VueSpinner from 'vue-spinner';
import Draggable from 'vuedraggable';
import find from 'lodash/find';
import get from 'lodash/get';
import maxBy from 'lodash/maxBy';
import sortBy from 'lodash/sortBy';
import Bluebird from 'bluebird';

import rpcClient from '../utils/rpc-client';
import { mapToTodos } from '../utils/todos';
import dashboardTpl from './dashboard.html!vtc';

import MyModal from './modal';
import MyTodoRow from './todo-row';

import './styles.css!css';

Bluebird.promisifyAll(rpcClient);

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
  },
  remove: function () {
    window.localStorage.removeItem(STORAGE_KEY);
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

function nextOrder (todos) {
  const nextOrderNumber = maxBy(todos, 'order').order + 1;
  return nextOrderNumber;
}

const MyDashboard = Vue.component('my-dashboard', {
  props: ['visibility'],
  render: dashboardTpl.render,
  staticRenderFns: dashboardTpl.staticRenderFns,
  data () {
    return {
      todos: [],
      error: null,
      eventDate: new Date().toDateString(),
      loading: false,
      newTodo: '',
      newSessionModalResult: null
    };
  },
  components: {
    RiseLoader: VueSpinner.RiseLoader,
    MyModal,
    MyTodoRow,
    Draggable
  },
  beforeRouteEnter (to, from, next) {
    rpcClient
      .getConfigAsync()
      .then(config => {
        next(vm => vm.setConfig(config));
      });
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
    persistNewOrder: function () {
      const oldTodos = this.todos;
      this.todos = mapToTodos(this.todos, { updateOrder: true });
      this.loading = true;
      Bluebird
        .each(this.todos, (todo, index) => {
          if (todo.order === oldTodos[index].order) {
            // Order unchanged for this todo, process next
            return;
          }
          /* eslint no-unused-vars: 0 */
          const { completed, ...serverTodoModel } = todo;
          return rpcClient.addOrUpdateTodoAsync(serverTodoModel);
        })
        .tap(() => (this.loading = false));
    },
    showLoader: function (promise) {
      this.loading = true;
      promise
        .delay(1000)
        .tap(() => (this.loading = false));
    },
    addTodo: function () {
      var value = this.newTodo && this.newTodo.trim();
      if (!value) {
        return;
      }
      this.loading = true;
      const todoToSave = { title: value, order: nextOrder(this.todos) };

      rpcClient
        .addOrUpdateTodoAsync(todoToSave)
        .delay(1000)
        .then(result => {
          this.todos.push(result);
          this.loading = false;
        })
        .finally(() => {
          this.newTodo = '';
        });
    },

    removeTodo: function (todo) {
      const removed = this.todos.splice(this.todos.indexOf(todo), 1);
      if (removed) {
        rpcClient.removeTodoAsync(todo);
      }
    },
    setConfig: function (config) {
      this.config = config;
      this.todos = sortBy(todoStorage.fetch(get(this.config, 'todos')), 'order');
    },
    startNewSession: function () {
      todoStorage.remove();
      const promise = new Bluebird((resolve) => {
        this.newSessionModalResult = resolve;
      });
      promise
        .then(result => {
          this.newSessionModalResult = null;
          if (result === 'ok') {
            this.loading = true;
            rpcClient
              .getConfigAsync()
              .then(this.setConfig)
              .delay(1000)
              .tap(() => (this.loading = false));
          }
        });
    },
    removeCompleted: function () {
      this.todos = filters.active(this.todos);
    }
  }
});

export default MyDashboard;
