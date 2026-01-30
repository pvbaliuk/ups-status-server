import {z} from 'zod';
import {UPS_COMMANDS} from './consts';

export type UpsCommand = typeof UPS_COMMANDS[number];

export const upsStatusDataSchema = z.object({
    voltages: z.object({
        input: z.number().min(0).default(0),
        output: z.number().min(0).default(0),
        battery: z.number().min(0).default(0)
    }).prefault({}),
    outputFrequency: z.number().min(0).default(50),
    loadLevel: z.number().min(0).max(100).default(0)
});

export const upsHistoryEntrySchema = z.object({
    ts: z.date(),
    inputVoltage: z.number().min(0),
    outputVoltage: z.number().min(0)
});

export type UPSStatusData = z.infer<typeof upsStatusDataSchema>;
export type UPSHistoryEntry = z.infer<typeof upsHistoryEntrySchema>;
