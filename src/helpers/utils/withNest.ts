import {INestApplicationContext} from '@nestjs/common';
import {NestFactoryStatic} from '@nestjs/core/nest-factory';

type WithNestFn = (app: INestApplicationContext, preventClosing: () => void) => Promise<void>;

/**
 * Executes a given function within the context of a NestJS application.
 *
 * This asynchronous function initializes a NestJS application context using the specified
 * module class and then executes the provided function `fn` with the application instance.
 * The application context is automatically closed upon completion of the function execution,
 * unless the function execution requests otherwise by invoking a callback.
 *
 * @param {any} moduleCls - The module class to be used for creating the NestJS application context.
 * @param {WithNestFn} fn - The function to be executed with the NestJS application context.
 *                             It receives the application instance and a callback to prevent
 *                             automatic application context closure.
 * @returns {Promise<void>} A promise that resolves when the function execution is complete.
 * @throws - Will throw an error if the `@nestjs/core` and/or `@nestjs/common` library is not found.
 * @throws - Will propagate any error thrown by the executed function `fn`.
 */
export async function withNest(moduleCls: any, fn: WithNestFn): Promise<void>{
    let nestFactory: NestFactoryStatic|null = null;
    try{
        nestFactory = (await import('@nestjs/core'))?.NestFactory;
        if(!nestFactory)
            throw new Error('NestFactory not found');
    }catch(e){
        throw new Error('@nestjs/core and @nestjs/common are required for this function to work');
    }

    const app = await nestFactory.createApplicationContext(moduleCls);
    let closeApplication: boolean = true;
    let _e: Error|undefined = undefined;

    try{
        await fn(app, () => {
            closeApplication = false;
        });
    }catch(e){
        console.error('Error caught while executing the WithNestFn. Error:', e);
        _e = e;
    }

    try{
        if(closeApplication)
            await app.close();
    }catch(e){
        console.error('Failed to close application. Error:', e);
    }

    if(_e)
        throw _e;
}
