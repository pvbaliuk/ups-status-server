import {Module} from '@nestjs/common';
import {SequelizeModule} from '@nestjs/sequelize';
import {UpsStat} from './ups-stats.model';
import {UpsService} from './ups.service';

@Module({
    imports: [
        SequelizeModule.forFeature([
            UpsStat
        ])
    ],
    providers: [UpsService],
    exports: [UpsService]
})
export class UpsModule{

}
