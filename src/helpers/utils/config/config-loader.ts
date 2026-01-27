import {sep} from 'node:path';
import {readFileSync} from 'fs';
import {z, ZodError} from 'zod';
import {parse} from 'yaml';
import {PROJ_ROOT} from '../consts';

const PROJROOT_REGEX = /^%projroot[\/\\]/i;

export abstract class ConfigLoader {

    /**
     * @template {z.ZodObject} S
     * @param {string} path You can use %projroot prefix for automatic project root resolution by AppConfigLoader.
     * Example: %projroot/config.yml
     * @param {S} schema
     * @returns {z.output<S>}
     */
    public static loadAndValidate<S extends z.ZodObject>(path: string, schema: S): (z.output<S> & {is_dev: boolean;}){
        if(PROJROOT_REGEX.test(path))
            path = path.replace(PROJROOT_REGEX, PROJ_ROOT + sep);

        let data: string = undefined!;
        let parsedYaml: any = undefined!;

        try{
            data = readFileSync(path, 'utf-8');
        }catch(e){
            console.error(`Failed to read config file at path: ${path}\nError: ${e?.message ?? '-'}; syscall: ${e?.syscall ?? '-'}`);
            process.exit(1);
        }

        try{
            parsedYaml = parse(data, {prettyErrors: true});
        }catch(e){
            console.error(`Failed to parse YAML file at path: ${path}\nError: ${e?.message ?? '-'}`);
            process.exit(1);
        }

        const extendedSchema = schema.transform(v => ({
            is_dev: (process?.env?.APP_CONTEXT ?? process?.env?.APPLICATION_CONTEXT ?? '').toLowerCase() !== 'production',
            ...v
        }));

        const {data: config, error, success} = extendedSchema.safeParse(parsedYaml);
        if(!success){
            if(error && error instanceof ZodError){
                console.error(`Failed to validate config file at path ${path}. Error: ${z.prettifyError(error)}`);
                process.exit(1);
            }

            console.error(`Failed to parse config file at path ${path}`);
            process.exit(1);
        }

        return config;
    }

}
