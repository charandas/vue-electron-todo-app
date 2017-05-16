const Client = System._nodeRequire('electron-rpc/client');
const client = new Client();

function getConfig (cb) {
  client.request('get-config', cb);
}

function addOrUpdateReminder (reminder, cb) {
  client.request('add-reminder', { reminder }, cb);
}

function addTodo (todo, cb) {
  client.request('add-todo', { todo }, cb);
}

function editTodo (todo, cb) {
  client.request('add-todo', { todo }, cb);
}

function removeTodo (todo, cb) {
  client.request('remove-todo', { todo }, cb);
}

export default {
  getConfig,
  addOrUpdateReminder,
  addTodo,
  removeTodo,
  editTodo
};
