import {devicesAsync, HID} from 'node-hid';
import {Logger} from '@nestjs/common';
import {formatError} from '@helpers/utils';
import {UPS_QS_REGEX} from './consts';
import {UpsCommand, UPSStatusData} from './types';

export class UpsHelper{

    private static logger = new Logger(UpsHelper.name);

    /**
     * @returns {Promise<HID | null>}
     */
    public static async discover(): Promise<HID|null>{
        UpsHelper.logger.log('Discovering UPS device...');

        const hidDevices = await devicesAsync();
        for(const device of hidDevices){
            if(!device.path)
                continue;

            const hid = new HID(device.path, {nonExclusive: true}),
                is_ok = UpsHelper.pingDevice(hid);

            if(is_ok){
                UpsHelper.logger.debug(`UPS device found! Vendor Id: ${device.vendorId}; product Id: ${device.productId}`);
                return hid;
            }else{
                UpsHelper.closeDevice(hid);
            }
        }

        UpsHelper.logger.log('UPS device not found');
        return null;
    }

    /**
     * @param {HID} device
     * @param {UpsCommand} command
     * @returns {boolean}
     */
    public static sendCommand(device: HID, command: UpsCommand): boolean{
        const commandBuffer = Buffer.alloc(8);
        commandBuffer[0] = 0x00;
        commandBuffer.write(command + '\r', 1, 'ascii');

        let bytesWritten: number = 0;
        try{
            bytesWritten = device.write(commandBuffer);
        }catch(e){
            UpsHelper.logger.error(`[${command}] Failed to write command to HID. Error: ${formatError(e, false)}`);
            return false;
        }

        return bytesWritten > 0;
    }

    /**
     * @param {HID} device
     * @param {number} readTimeout
     * @param {number} totalTimeout
     * @returns {string | null}
     */
    public static readDevice(device: HID, readTimeout: number, totalTimeout: number): string|null{
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

    /**
     * @param {HID} device
     * @returns {boolean}
     */
    public static pingDevice(device: HID): boolean{
        if(!UpsHelper.sendCommand(device, 'QWS'))
            return false;

        const response = this.readDevice(device, 100, 1_000);
        return response !== null && response.includes('QWS');
    }

    /**
     * @param {HID} device
     * @returns {UPSStatusData | null}
     */
    public static queryStatus(device: HID): UPSStatusData|null{
        if(!UpsHelper.sendCommand(device, 'QS'))
            return null;

        const response = UpsHelper.readDevice(device, 100, 1_000);
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
     * @param {HID | null} [device]
     */
    public static closeDevice(device?: HID|null): void{
        if(device)
            try{device.close();}catch(e){}
    }

}
