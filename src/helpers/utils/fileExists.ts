import {access} from 'node:fs/promises';

/**
 * @param {string} path
 * @param {number} mode
 * @returns {Promise<boolean>}
 */
export async function fileExists(path: string, mode?: number): Promise<boolean>{
    try{
        await access(path, mode);
        return true;
    }catch(e){
        return false;
    }
}
