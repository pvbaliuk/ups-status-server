import {Worker} from 'node:worker_threads';
import {resolve} from 'node:path';
import {Injectable, Logger, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {fileExists, formatError} from '@helpers/utils';
import {UPSHistoryEntry, UPSStatusData, upsStatusDataSchema} from './types';
import {UpsStat} from './ups-stats.model';
import {Op} from 'sequelize';

@Injectable()
export class UpsService implements OnModuleInit, OnModuleDestroy{

    private readonly logger = new Logger(UpsService.name);
    private worker: Worker|null = null;
    private upsStatus: UPSStatusData|null = null;

    public constructor(
        @InjectModel(UpsStat)
        private readonly stats: typeof UpsStat
    ) {}

    /**
     * @returns {Promise<void>}
     */
    public async onModuleInit(): Promise<void>{
        const workerFilenameTs = resolve(__dirname, 'worker', 'worker.ts'),
            workerFilenameJs = resolve(__dirname, 'worker', 'worker.js'),
            workerFilename = (await fileExists(workerFilenameJs)) ? workerFilenameJs : workerFilenameTs;

        this.worker = new Worker(workerFilename, {});
        this.worker.on('message', this.onWorkerMessage);
    }

    /**
     * @returns {Promise<void>}
     */
    public async onModuleDestroy(): Promise<void>{
        if(this.worker){
            this.worker.off('message', this.onWorkerMessage);
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

    /**
     * @param {Date} from
     * @param {Date} [to]
     * @returns {Promise<UPSHistoryEntry[]>}
     */
    public async getHistory(from: Date, to?: Date): Promise<UPSHistoryEntry[]>{
        if(to && from.getTime() > to.getTime()){
            const _ = from;
            from = to;
            to = _;
        }

        const entries = await this.stats.findAll({
            where: {
                ts: {
                    [Op.gte]: from,
                    [Op.lte]: to ?? new Date()
                },
            }
        });

        return entries.map(entry => ({
            ts: entry.ts,
            inputVoltage: entry.inputVoltage,
            outputVoltage: entry.outputVoltage
        }));
    }

    /**
     * @param {UPSStatusData} message
     * @returns {Promise<void>}
     */
    private onWorkerMessage = async (message: UPSStatusData): Promise<void> => {
        const {success, data} = upsStatusDataSchema.safeParse(message);
        if(!success){
            this.upsStatus = null;
            return;
        }

        this.upsStatus = data;
        try{
            await this.stats.create({
                ts: new Date(),
                inputVoltage: this.upsStatus.voltages.input,
                outputVoltage: this.upsStatus.voltages.output
            }, {ignoreDuplicates: true});
        }catch(e){
            this.logger.warn(`Failed to write data to sqlite database. Error: ${formatError(e)}`);
        }
    }

}
