import '../../../bootstrap';

import {parentPort} from 'node:worker_threads';
import {Ups} from './ups';

const ups = new Ups(parentPort!);

parentPort!.once('close', async () => {
    await ups.destroy();
});

ups.init()
    .then(() => {})
    .catch(() => {});
