import 'module-alias/register';
import {loadTsconfigPaths} from './helpers/utils/load-tsconfig-paths';
import {join} from 'path';

const _path = __dirname.split(/[\\\/]src/i)[0];
loadTsconfigPaths(join(_path, 'src'), join(_path, 'tsconfig.json'));
