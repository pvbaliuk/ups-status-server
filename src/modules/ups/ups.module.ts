import {Module} from '@nestjs/common';
import {SequelizeModule} from '@nestjs/sequelize';
import {UpsStat} from './ups-stats.model';
import {UpsService} from './ups.service';
import {UpsWorker} from './ups.worker';

@Module({
    imports: [
        SequelizeModule.forFeature([
            UpsStat
        ])
    ],
    providers: [
        UpsService,
        UpsWorker
    ],
    exports: [
        UpsService,
        UpsWorker
    ]
})
export class UpsModule{

}
