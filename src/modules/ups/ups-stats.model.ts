import {Column, DataType, Model, PrimaryKey, Table} from 'sequelize-typescript';
import {type Optional} from 'sequelize';

interface UpsStatAttributes{
    id: number;
    inputVoltage: number;
    outputVoltage: number;
    measurements: number;
    fromTs: Date;
    toTs: Date;
}

interface UpsStatCreationAttributes extends Optional<UpsStatAttributes, 'id' | 'measurements'>{}

@Table({
    tableName: 'ups-stats',
    paranoid: false,
    timestamps: false
})
export class UpsStat extends Model<UpsStatAttributes, UpsStatCreationAttributes>{

    @PrimaryKey
    @Column({type: DataType.INTEGER, allowNull: false, autoIncrement: true})
    declare id: number;

    @Column({type: DataType.INTEGER, allowNull: false, defaultValue: 0})
    declare inputVoltage: number;

    @Column({type: DataType.INTEGER, allowNull: false, defaultValue: 0})
    declare outputVoltage: number;

    @Column({type: DataType.INTEGER, allowNull: false, defaultValue: 1})
    declare measurements: number;

    @Column({type: DataType.DATE, allowNull: false})
    declare fromTs: Date;

    @Column({type: DataType.DATE, allowNull: false})
    declare toTs: Date;

}
