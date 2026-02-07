import './bootstrap';

import {join} from 'node:path';
import {Logger} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import {program} from 'commander';
import {ignorePromise} from 'jsn-utils';
import config from '@config';
import {withNest} from '@helpers/utils';
import {ApiModule} from '@modules/api';
import {UpsModule, UpsWorker} from '@modules/ups';

const logger = new Logger('MAIN');

program
    .command('api')
    .action(async () => {
        const api = await NestFactory.create<NestExpressApplication>(ApiModule, {
            cors: {
                origin: '*',
                methods: ['HEAD', 'OPTIONS', 'GET'],
                allowedHeaders: ['Accept', 'Content-Type'],
                credentials: true
            },
            abortOnError: true
        });

        api.enable('trust proxy');
        api.disable('x-powered-by');
        api.useStaticAssets(join(process.cwd(), 'public'));
        const upsWorker = api.get(UpsWorker);

        await api.listen(config.api.listen_port, async () => {
            logger.log(`API started and listening for incoming connections on port ${config.api.listen_port}...`);
            await upsWorker.start();
        });
    });

program
    .command('db:optimize')
    .action(() => withNest(UpsModule, async (app) => {

    }));

ignorePromise(program.parseAsync());
