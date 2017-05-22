import Vue from 'vue';
import VueSpinner from 'vue-spinner';
import Draggable from 'vuedraggable';
import find from 'lodash/find';
import get from 'lodash/get';
import maxBy from 'lodash/maxBy';
import sortBy from 'lodash/sortBy';
import Bluebird from 'bluebird';
import electron from '@node/electron';

import rpcClient from '../utils/rpc-client';
import { mapToTodos, isSeparatorLabel } from '../utils/todos';
import dashboardTpl from './dashboard.html!vtc';

import MyModal from './modal';
import MyTodoRow from './todo-row';

import './dashboard.css!css';

Bluebird.promisifyAll(rpcClient);

const TEMPLATE_ID_STORAGE_KEY = 'templateId-techeast';
const templateIdStorage = {
  get: function () {
    return window.localStorage.getItem(TEMPLATE_ID_STORAGE_KEY) || 'sunday_satsang';
  },
  // templateId: ex: sunday_satsang
  set: function (templateId) {
    window.localStorage.setItem(TEMPLATE_ID_STORAGE_KEY, templateId);
  },
  remove: function () {
    window.localStorage.removeItem(TEMPLATE_ID_STORAGE_KEY);
  }
};

const STORAGE_KEY = 'todos-techeast';
// Of the form:
// { 'sunday_satsang': [...allTheSundayTodos], 'special_teaching': [...allTheSpecialTodos] }
const todoStorage = {
  templateExists: function () {
    const fromStorage = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return !!get(fromStorage, templateIdStorage.get());
  },
  fetch: function (todosTemplate, { hardRefresh = false }) {
    const fromStorage = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    const todos = !hardRefresh
      ? get(fromStorage, templateIdStorage.get(), mapToTodos(todosTemplate))
      : mapToTodos(todosTemplate);
    return todos;
  },
  save: function (todos) {
    // First parse current storage, we augment on previous states from different template ids
    const fromStorage = JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
    const toSave = Object.assign(fromStorage, { [templateIdStorage.get()]: todos });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  },
  remove: function () {
    // First parse current storage, we augment on previous states from different template ids
    // delete only the active key
    const fromStorage = JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
    const toSave = Object.assign(fromStorage, { [templateIdStorage.get()]: null });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }
};

// visibility filters
var filters = {
  all: function (todos) {
    return todos;
  },
  active: function (todos) {
    return todos.filter(function (todo) {
      return !isSeparatorLabel(todo) && !todo.completed;
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
      config: null,
      templateId: null,
      templateIds: [],
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
      .getConfigAsync({ templateId: templateIdStorage.get() })
      .then(config => {
        next(vm => vm.setConfig(config));
      });
  },
  created: function () {
    electron.ipcRenderer.on('checkOffTodo', (event, todoId) => {
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
    },
    templateId: {
      handler: function (templateId, oldTemplateId) {
        if (!oldTemplateId && templateId) { // this is on page load, just save id
          templateIdStorage.set(templateId.value);
        } else if (templateId) {
          if (get(templateId, 'value') === get(oldTemplateId, 'value')) {
            return;
          }
          templateIdStorage.set(templateId.value);
          this.startNewSession({
            showModal: true // since it resets the todos when switching templates
          });
        }
      }
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
    nextOrder: function () {
      const nextOrderNumber = maxBy(this.todos, 'order').order + 1;
      return nextOrderNumber;
    },
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
          return rpcClient.reorderTodoAsync(Object.assign(serverTodoModel, {
            // override, in case, we are modifying order for a base todo
            orderTemplateId: this.templateId.value
          }));
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
      const todoToSave = {
        title: value,
        templateId: this.templateId.value,
        order: this.nextOrder()
      };

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
    // options: { hardRefresh = false }
    setConfig: function (config, options = {}) {
      console.log(config);
      this.config = config; // TODO: undocumented data
      this.templateIds = config.templateIds;
      this.todos = sortBy(todoStorage.fetch(get(config, 'todos'), { hardRefresh: options.hardRefresh }), 'order');

      const newTemplateId = templateIdStorage.get();
      // Triggering change on the same value would lead to infinite loop
      // with the watcher for templateId
      if (get(this.templateId, 'value') !== newTemplateId) {
        this.templateId = find(this.templateIds, { value: newTemplateId });
      }
    },
    // options: { showModal: true }
    startNewSession: function (options = { showModal: true }) {
      const promise = new Bluebird((resolve) => {
        if (options.showModal) {
          this.newSessionModalResult = resolve;
        } else {
          resolve('ok');
        }
      });
      promise
        .then(result => {
          this.newSessionModalResult = null;
          if (result === 'ok') {
            this.loading = true;
            rpcClient
              .getConfigAsync({ templateId: this.templateId.value })
              .then(config => {
                todoStorage.remove(this.templateId);
                this.setConfig(config, { hardRefresh: true });
              })
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
