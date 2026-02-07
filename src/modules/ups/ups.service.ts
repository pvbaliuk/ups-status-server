import {Injectable, Logger} from '@nestjs/common';
import {InjectConnection, InjectModel} from '@nestjs/sequelize';
import {Op, Transaction} from 'sequelize';
import {Repository, Sequelize} from 'sequelize-typescript';
import {AddUpsStatusData, addUpsStatusDataSchema, UPSHistoryEntry, UPSStatusData} from './types';
import {UpsStat} from './ups-stats.model';

@Injectable()
export class UpsService{

    private readonly logger = new Logger(UpsService.name);
    private upsStatus: UPSStatusData|null = null;
    private readonly stats: Repository<UpsStat>;

    public constructor(
        @InjectConnection()
        private readonly db: Sequelize
    ) {
        this.stats = this.db.getRepository(UpsStat);
    }

    /**
     * @param {AddUpsStatusData} data
     * @returns {Promise<boolean>}
     */
    public async add(data: AddUpsStatusData): Promise<boolean>{
        const upsStatus = addUpsStatusDataSchema.parse(data);
        const result = await this.db.transaction({isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE}, async tx => {
            const lastEntry = await this.stats.findOne({
                order: [['id', 'DESC']],
                transaction: tx,
                lock: tx.LOCK.UPDATE
            });

            if(lastEntry){
                if(lastEntry.inputVoltage === upsStatus.voltages.input * 100
                && lastEntry.outputVoltage === upsStatus.voltages.output * 100){
                    lastEntry.measurements += 1;
                    lastEntry.toTs = upsStatus.ts;

                    await lastEntry.save({transaction: tx});
                    return true;
                }
            }

            await this.stats.create({
                inputVoltage: upsStatus.voltages.input * 100,
                outputVoltage: upsStatus.voltages.output * 100,
                measurements: 1,
                fromTs: upsStatus.ts,
                toTs: upsStatus.ts
            }, {transaction: tx});

            return true;
        });

        this.upsStatus = upsStatus;
        return result;
    }

    /**
     * @returns {UPSStatusData | null}
     */
    public getRealtimeStatus(): UPSStatusData|null{
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
                fromTs: {
                    [Op.gte]: from
                },
                toTs: {
                    [Op.lte]: to
                }
            }
        });

        return entries.map(entry => ({
            ts: entry.fromTs,
            inputVoltage: entry.inputVoltage / 100,
            outputVoltage: entry.outputVoltage / 100
        }));
    }

}
