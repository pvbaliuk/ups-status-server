import {MessagePort} from 'node:worker_threads';
import {Logger} from '@nestjs/common';
import {HID} from 'node-hid';
import {ignorePromise} from 'jsn-utils';
import * as hid from 'node-hid';
import {formatError} from '@helpers/utils';
import {UPS_QS_REGEX} from '../consts';
import {UPSStatusData} from '../types';

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
            this.logger.warn('Failed to process UPS HID. Continue...');

            this.closeDevice(this.device);
            this.device = null;
        }

        this.loopTimerRef = setTimeout(this.loop, this.device ? 250 : 2_000);
    }

    /**
     * @returns {Promise<void>}
     * @private
     */
    private async processDevice(): Promise<void>{
        if(!this.device){
            await this.discoverUPSHID();
        }else{
            if(!this.pingDevice(this.device)){
                this.closeDevice(this.device);
                this.device = null;
                return;
            }
        }

        const response = this.queryStatus(this.device!);
        if(!response)
            return;

        this.port.postMessage({ups_status: response});
    }

    /**
     * @returns {Promise<void>}
     */
    private async discoverUPSHID(): Promise<void>{
        this.logger.debug('Discovering UPS HID...');

        const hidDevices = await hid.devicesAsync();
        for(const device of hidDevices){
            if(!device.path)
                continue;

            const hidDevice = new HID(device.path, {nonExclusive: true});
            const is_ok = this.pingDevice(hidDevice);

            if(is_ok){
                this.logger.debug(`UPS HID found! Vendor ID: ${device.vendorId}; product ID: ${device.productId}`);
                this.device = hidDevice;
                return;
            }else{
                this.closeDevice(hidDevice);
            }

            this.logger.debug('Continue discovery...');
        }
    }

    /**
     * @param {HID} device
     * @returns {boolean}
     * @private
     */
    private pingDevice(device: HID): boolean{
        if(!device)
            return false;

        const qwsCommand = Buffer.alloc(8);
        qwsCommand[0] = 0x00;
        qwsCommand.write('QWS\r', 1, 'ascii');

        try{
            device.write(qwsCommand);
        }catch(e){
            this.logger.error(`[QWS (ping)] Failed to write to HID. Error: ${formatError(e, false)}`);
            return false;
        }

        const response = this.readTimeout(device, 100, 1_000);
        return response !== null && response.includes('QWS');
    }

    /**
     * @param {HID} device
     * @returns {UPSStatusData | null}
     * @private
     */
    private queryStatus(device: HID): UPSStatusData|null{
        const qsCommand = Buffer.alloc(8);
        qsCommand[0] = 0x00;
        qsCommand.write('QS\r', 1, 'ascii');

        try{
            device.write(qsCommand);
        }catch(e){
            this.logger.error(`[QS] Failed to write to HID. Error: ${formatError(e, false)}`);
            return null;
        }

        const response = this.readTimeout(device, 100, 1_000);
        if(!response || !UPS_QS_REGEX.test(response))
            return null;

        const pieces = response.substring(1, response.length - 1)
            .split(/\s+/)
            .filter(v => v.trim() !== '');

        return {
            inputVoltage: Number(pieces[0]),
            outputVoltage: Number(pieces[2]),
            batteryVoltage: Number(pieces[5]),
            lineFrequency: Number(pieces[4]),
            upsLoad: Number(pieces[3])
        };
    }

    /**
     * @param {HID|null} device
     * @private
     */
    private closeDevice(device?: HID|null): void{
        if(device)
            try{device.close();}catch(e){}
    }

    /**
     * @param {HID} device
     * @param {number} readTimeout
     * @param {number} totalTimeout
     * @returns {string | null}
     * @private
     */
    private readTimeout(device: HID, readTimeout: number, totalTimeout: number): string|null{
        if(readTimeout < 1)
            throw new TypeError('readTimeout should be greater than 0');

        if(totalTimeout < 1)
            throw new TypeError('totalTimeout should be greater than 0');

        const startTime = Date.now();
        const bytes: number[] = [];
        while(Date.now() - startTime < totalTimeout){
            try{
                const readBytes = device.readTimeout(readTimeout);
                if(readBytes.length > 0)
                    bytes.push(...readBytes);
            }catch(e){
                return null;
            }
        }

        if(bytes.length === 0)
            return null;

        return Buffer.from(bytes).toString('ascii');
    }

}
