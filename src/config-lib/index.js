import path from 'path';

import aceConfig from './config';

const pathToConfig = path.resolve(__dirname, '..', 'config');
export default aceConfig(pathToConfig);
