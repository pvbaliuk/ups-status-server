import {z} from 'zod';
import ms, {StringValue} from 'ms';

//region Time string

const TIMESTRING_UNIT = ['Years', 'Year', 'Yrs', 'Yr', 'Y', 'Weeks', 'Week', 'W', 'Days', 'Day', 'D', 'Hours', 'Hour', 'Hrs', 'Hr', 'H', 'Minutes', 'Minute', 'Mins', 'Min', 'M', 'Seconds', 'Second', 'Secs', 'Sec', 's', 'Milliseconds', 'Millisecond', 'Msecs', 'Msec', 'Ms'] as const;
const TIMESTRING_REGEX = new RegExp(`\\d+\\s*(?:${TIMESTRING_UNIT.map(unit => unit.toLowerCase()).join('|')})`, 'i');

export const configTimeStringSchema = z.string().nonempty().regex(TIMESTRING_REGEX).transform(v => ms(v as StringValue));

//endregion

//region Connection schema

export const configConnectionSchema = z.object({
    host: z.string().nonempty(),
    port: z.number().min(1).max(65535),
    user: z.string(),
    pass: z.string()
});

//endregion

//region MongoDB schema

export const configMongodbConnectionSchema = configConnectionSchema.extend({
    db: z.string().nonempty(),
    auth_db: z.string().optional(),
    connectTimeout: configTimeStringSchema.default(5_000)
}).transform(v => ({
    ...v,
    auth_db: v.auth_db || v.db,
    dsn: `mongodb://${v.host}:${v.port}/${v.db}`
}));

//endregion

//region Redis schema

export const configRedisConnectionSchema = configConnectionSchema.extend({
    db: z.number().default(0),
    key_prefix: z.string().default('')
});

//endregion

//region RabbitMQ

export const configRabbitConnectionSchema = configConnectionSchema.extend({
    vhost: z.string().default('/')
});

//endregion
