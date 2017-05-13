const Client = System._nodeRequire('electron-rpc/client');
const client = new Client();

export function getConfig (cb) {
  client.request('get-config', cb);
}
