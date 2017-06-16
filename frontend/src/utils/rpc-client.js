import Bluebird from 'bluebird';
import Client from '@node/electron-rpc/client';

const client = new Client();

function getConfig (options, cb) {
  client.request('get-config', { options }, cb);
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

function reorderTodo (todo, cb) {
  client.request('reorder-todo', { todo }, cb);
}

function removeTodo (todo, cb) {
  client.request('remove-todo', { todo }, cb);
}

function extractAudio (task, cb) {
  client.request('extract-audio', { task }, cb);
}

const rpcClient = {
  getConfig,
  addOrUpdateReminder,
  removeReminder,
  addOrUpdateTodo,
  removeTodo,
  reorderTodo,
  extractAudio
};

export default Bluebird.promisifyAll(rpcClient);
