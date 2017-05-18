const Client = System._nodeRequire('electron-rpc/client');
const client = new Client();

function getConfig (cb) {
  client.request('get-config', cb);
}

function addOrUpdateReminder (reminder, cb) {
  client.request('add-reminder', { reminder }, cb);
}

function removeReminder (reminder, cb) {
  client.request('remove-reminder', { reminder }, cb);
}

function addOrUpdateTodo (todo, cb) {
  client.request('add-todo', { todo }, cb);
}

function removeTodo (todo, cb) {
  client.request('remove-todo', { todo }, cb);
}

export default {
  getConfig,
  addOrUpdateReminder,
  removeReminder,
  addOrUpdateTodo,
  removeTodo
};
