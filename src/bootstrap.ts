import 'module-alias/register';
import {resolve} from 'node:path';
import {loadTsconfigPaths} from './helpers/utils/load-tsconfig-paths';

loadTsconfigPaths(__dirname, resolve(__dirname, '..', 'tsconfig.json'));