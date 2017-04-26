import path from 'path';

import aceConfig from './config';

// TODO: ugly hack but only for development
const pathToConfig = process.argv[2] === 'development'
  ? path.resolve(__dirname, '..', 'config')
  : path.resolve(__dirname, '..', '..', 'config');
export default aceConfig(pathToConfig);
