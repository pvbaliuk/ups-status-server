import 'module-alias/register';
import {loadTsconfigPaths} from './helpers/utils/load-tsconfig-paths';
import {join} from 'path';

loadTsconfigPaths(__dirname, join(__dirname, '..', 'tsconfig.json'));
