import {UPS_COMMANDS} from './consts';

export type UPSStatusData = {
    inputVoltage: number;
    outputVoltage: number;
    batteryVoltage: number;
    lineFrequency: number;
    upsLoad: number;
}

export type UpsCommand = typeof UPS_COMMANDS[number];
