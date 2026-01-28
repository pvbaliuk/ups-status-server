import './bootstrap';

import {Logger} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import {program} from 'commander';
import {join} from 'path';
import config from '@config';
import {ApiModule} from '@modules/api';
import {ignorePromise} from 'jsn-utils';

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

        await api.listen(config.api.listen_port, () => {
            logger.log(`API started and listening for incoming connections on port ${config.api.listen_port}...`);
        });
    });

ignorePromise(program.parseAsync());
