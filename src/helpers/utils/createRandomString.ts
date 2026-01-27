import { randomBytes } from 'node:crypto';

/**
 * @param {number} length
 * @returns {Promise<string>}
 */
export function createRandomString(length: number): Promise<string> {
    const isDivisibleByTwo = length % 2 === 0,
        bytesLength = isDivisibleByTwo ? length / 2 : length - 1 > 0 ? (length - 1) / 2 : (length + 1) / 2;

    return new Promise<string>((resolve, reject) => {
        randomBytes(bytesLength, (err, buff) => {
            if (err) return reject(err);

            return resolve(buff.toString('hex'));
        });
    });
}
