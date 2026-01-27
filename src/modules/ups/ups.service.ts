import {Worker} from 'node:worker_threads';
import {resolve} from 'node:path';
import {Injectable, Logger, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {UPSStatusData} from './types';
import {fileExists} from '@helpers/utils';

@Injectable()
export class UpsService implements OnModuleInit, OnModuleDestroy{

    private readonly logger = new Logger(UpsService.name);
    private worker: Worker|null = null;
    private upsStatus: UPSStatusData|null = null;

    /**
     * @returns {Promise<void>}
     */
    public async onModuleInit(): Promise<void>{
        const workerFilenameTs = resolve(__dirname, 'worker', 'worker.ts'),
            workerFilenameJs = resolve(__dirname, 'worker', 'worker.js'),
            workerFilename = (await fileExists(workerFilenameJs)) ? workerFilenameJs : workerFilenameTs;

        this.worker = new Worker(workerFilename, {});
        this.worker.on('message', message => {
            //this.logger.debug('UPS status:', message?.ups_status);
            this.upsStatus = message?.ups_status as any;
        });
    }

    /**
     * @returns {Promise<void>}
     */
    public async onModuleDestroy(): Promise<void>{
        if(this.worker){
            await this.worker.terminate();
            this.worker = null;
        }
    }

    /**
     * @returns {UPSStatusData | null}
     */
    public getStatus(): UPSStatusData|null{
        if(!this.upsStatus)
            return null;

        return Object.assign({}, this.upsStatus);
    }

}
