import path from 'path';
import nconf from 'nconf';
import addSecretPaths from './add-secret-paths';

const Provider = nconf.Provider;

function loadConfig (conf, args, name, env) {
  args.forEach((arg, i) => {
    const part = `0000${i}`.slice(-4);
    const confName = `${name}-${part}`;
    conf.use(confName, {
      type: 'file',
      file: path.join(arg, `${env}.json`)
    });
  });
}

export default function fathmConfig (...allArgs) {
  const conf = (new Provider()).argv().env('__');

  // Convert arguments to a normal array so that we can pass it
  // outside of the function without losing optimizations.
  const args = addSecretPaths(allArgs);

  // Load config files
  loadConfig(conf, args, 'local', 'local');
  loadConfig(conf, args, 'env', conf.get('NODE_ENV') || 'development');
  loadConfig(conf, args, 'base', 'base');

  return Object.freeze({
    get: conf.get.bind(conf)
  });
}
