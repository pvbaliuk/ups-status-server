import {MessagePort} from 'node:worker_threads';
import {Logger} from '@nestjs/common';
import {HID} from 'node-hid';
import {ignorePromise} from 'jsn-utils';
import {UpsHelper} from '../ups.helper';
import {UPSStatusData, upsStatusDataSchema} from '../types';

export class Ups{

    private readonly logger = new Logger(Ups.name);
    private loopTimerRef: NodeJS.Timeout|null = null;
    private device: HID|null = null;

    public constructor(private readonly port: MessagePort) {}

    /**
     * @returns {Promise<void>}
     */
    public async init(): Promise<void>{
        ignorePromise(this.loop());
    }

    /**
     * @returns {Promise<void>}
     */
    public async destroy(): Promise<void>{
        if(this.loopTimerRef !== null){
            clearTimeout(this.loopTimerRef);
            this.loopTimerRef = null;
        }

        try{
            this.device?.close();
            this.device = null;
        }catch(e){}
    }

    /**
     * @returns {Promise<void>}
     * @private
     */
    private loop = async (): Promise<void> => {
        try{
            await this.processDevice();
        }catch(e){
            this.logger.warn('Failed to process UPS device. Continue...');

            UpsHelper.closeDevice(this.device);
            this.device = null;
        }

        this.loopTimerRef = setTimeout(this.loop, this.device ? 1_000 : 5_000);
    }

    /**
     * @returns {Promise<void>}
     * @private
     */
    private async processDevice(): Promise<void>{
        if(!this.device){
            const device = await UpsHelper.discover();
            if(!device)
                return;

            this.device = device;
        }else{
            if(!UpsHelper.pingDevice(this.device)){
                UpsHelper.closeDevice(this.device);
                this.device = null;
                return;
            }
        }

        const response = UpsHelper.queryStatus(this.device!);
        if(!response)
            return;

        this.port.postMessage(response);
    }

}
