import {Module} from '@nestjs/common';
import {SequelizeModule} from '@nestjs/sequelize';
import config from '@config';
import {UpsModule} from '@modules/ups';
import {UpsController} from './ups.controller';

@Module({
    imports: [
        SequelizeModule.forRoot({
            logging: false,
            dialect: 'sqlite',
            storage: config.dbPath,
            repositoryMode: true,
            autoLoadModels: true,
            synchronize: true
        }),
        UpsModule
    ],
    controllers: [
        UpsController
    ]
})
export class ApiModule{

}
