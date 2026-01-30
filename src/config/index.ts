import {join} from 'path';
import {z} from 'zod';
import {ConfigLoader, PROJ_ROOT} from '@helpers/utils';

export default ConfigLoader.loadAndValidate('%projroot/config.yml', z.object({
    api: z.object({
        listen_port: z.number().default(2444)
    }),
    dbPath: z.string().default(join(PROJ_ROOT, 'ups.db'))
}));
