import {Module} from '@nestjs/common';
import {UpsModule} from '@modules/ups';
import {UpsController} from './ups.controller';

@Module({
    imports: [
        UpsModule
    ],
    controllers: [
        UpsController
    ]
})
export class ApiModule{

}
