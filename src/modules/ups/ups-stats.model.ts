import {Column, DataType, Model, PrimaryKey, Table} from 'sequelize-typescript';

interface UpsStatAttributes{
    ts: Date;
    inputVoltage: number;
    outputVoltage: number;
}

interface UpsStatCreationAttributes extends UpsStatAttributes{}

@Table({
    tableName: 'ups-stats',
    paranoid: false,
    timestamps: false
})
export class UpsStat extends Model<UpsStatAttributes, UpsStatCreationAttributes>{

    @PrimaryKey
    @Column({type: DataType.DATE, allowNull: false})
    declare ts: Date;

    @Column({type: DataType.INTEGER, allowNull: false, defaultValue: 0})
    declare inputVoltage: number;

    @Column({type: DataType.INTEGER, allowNull: false, defaultValue: 0})
    declare outputVoltage: number;

}
