import {BadRequestException, Controller, Get, Param, Query, Res} from '@nestjs/common';
import {type Response} from 'express';
import {UpsService} from '@modules/ups';

@Controller('ups')
export class UpsController{

    public constructor(private readonly ups: UpsService) {}

    @Get('status')
    public async status(@Res({passthrough: true}) res: Response, @Query() query: any){
        const status = this.ups.getRealtimeStatus();
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

    @Get('history')
    public async history(@Query('from') from: string, @Query('to') to?: any){
        const dtRegex = /\d{2}-\d{2}-\d{4}\s\d{2}:\d{2}:\d{2}/i;
        if(!dtRegex.test(from))
            throw new BadRequestException('Invalid :from parameter');

        if(to && !dtRegex.test(to))
            throw new BadRequestException('Invalid :to parameter');

        return this.ups.getHistory(new Date(from), to ? new Date(to) : undefined);
    }

}
