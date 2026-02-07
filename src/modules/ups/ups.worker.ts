import {resolve} from 'node:path';
import {Worker} from 'node:worker_threads';
import {Injectable, Logger, OnModuleDestroy} from '@nestjs/common';
import {fileExists, formatError} from '@helpers/utils';
import {UPSStatusData, upsStatusDataSchema} from './types';
import {UpsService} from './ups.service';

@Injectable()
export class UpsWorker implements OnModuleDestroy{

    private readonly logger = new Logger(UpsWorker.name);
    private worker: Worker|null = null;
    private clamp_timer_ref: NodeJS.Timeout|null = null;

    public constructor(
        protected readonly ups: UpsService
    ) {}

    /**
     * @returns {Promise<void>}
     */
    public async start(): Promise<void>{
        const workerFilenameTs = resolve(__dirname, 'worker', 'worker.ts'),
            workerFilenameJs = resolve(__dirname, 'worker', 'worker.js'),
            workerFilename = (await fileExists(workerFilenameJs)) ? workerFilenameJs : workerFilenameTs;

        this.worker = new Worker(workerFilename, {});
        this.worker.on('message', this.onWorkerMessage);
    }

    /**
     * @returns {Promise<void>}
     */
    public async stop(): Promise<void>{
        if(this.clamp_timer_ref){
            clearTimeout(this.clamp_timer_ref);
            this.clamp_timer_ref = null;
        }

        if(this.worker){
            this.worker.off('message', this.onWorkerMessage);
            await this.worker.terminate();
            this.worker = null;
        }
    }

    /**
     * @returns {Promise<void>}
     */
    public onModuleDestroy(): Promise<void>{
        return this.stop();
    }

    /**
     * @param {UPSStatusData} message
     * @returns {Promise<void>}
     */
    private onWorkerMessage = async (message: UPSStatusData): Promise<void> => {
        const {success, data: upsStatus} = upsStatusDataSchema.safeParse(message);
        if(!success || !upsStatus)
            return;

        try{
            await this.ups.add({
                ts: new Date(),
                voltages: {
                    input: upsStatus.voltages.input,
                    output: upsStatus.voltages.output,
                    battery: upsStatus.voltages.battery
                },
                outputFrequency: upsStatus.outputFrequency,
                loadLevel: upsStatus.loadLevel
            });
        }catch(e){
            this.logger.warn(`Failed to store UPS status data. Error: ${formatError(e)}`);
        }
    }

}
