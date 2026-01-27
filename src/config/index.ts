import {z} from 'zod';
import {ConfigLoader} from '@helpers/utils';

export default ConfigLoader.loadAndValidate('%projroot/config.yml', z.object({
    api: z.object({
        listen_port: z.number().default(2444)
    })
}));
