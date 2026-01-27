import {dirname, resolve, relative} from 'node:path';
import {addAliases} from 'module-alias';

/**
 * Before using this function, you should import module-alias/register first
 *
 * @param {string} fromPath
 * @param {string} tsconfigPath
 * @returns {void}
 */
export function loadTsconfigPaths(fromPath: string, tsconfigPath: string): void{
    const tsconfig = require(tsconfigPath),
        tsconfigDirPathname = dirname(tsconfigPath),
        paths: Record<string, string> = {};

    Object.entries((tsconfig?.compilerOptions?.paths ?? {}) as Record<string, string[]>)
        .forEach(([moduleName, pathArray]) => {
            if(pathArray.length === 0)
                return;

            paths[moduleName] = resolve(tsconfigDirPathname, relative(tsconfigDirPathname, fromPath), pathArray[0]);
        });

    addAliases(paths);
}
