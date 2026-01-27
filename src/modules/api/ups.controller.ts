import {Controller, Get, Query, Res} from '@nestjs/common';
import {type Response} from 'express';
import {UpsService} from '@modules/ups';

@Controller('ups')
export class UpsController{

    public constructor(private readonly ups: UpsService) {}

    @Get('status')
    public async status(@Res({passthrough: true}) res: Response, @Query() query: any){
        const status = this.ups.getStatus();
        if(query && query?.['text'] && (query?.['text']?.toLowerCase() === 'yes' || query?.['text']?.toLowerCase() === 'true')){
            res.contentType('text/plain');
            return [
                status ? 'status:connected' : 'status:not_connected',
                ...(Array.from(Object.entries(status ?? {})).map(([key, value]) => `${key}:${value}`))
            ].join(';');
        }

        if(!status)
            return {status: 'not_connected'};

        return {status: 'connected', ...status};
    }

}
