const Client = System._nodeRequire('electron-rpc/client');
const client = new Client();

export function getConfig (cb) {
  client.request('get-config', cb);
}

export function addReminder (reminder, cb) {
  client.request('add-reminder', { reminder }, cb);
}

export function addTodo (todo, cb) {
  client.request('add-todo', { todo }, cb);
}
