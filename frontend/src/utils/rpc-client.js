const Client = System._nodeRequire('electron-rpc/client');
const client = new Client();

function getConfig (cb) {
  client.request('get-config', cb);
}

function addReminder (reminder, cb) {
  client.request('add-reminder', { reminder }, cb);
}

function addTodo (todo, cb) {
  client.request('add-todo', { todo }, cb);
}

export default {
  getConfig,
  addReminder,
  addTodo
};
