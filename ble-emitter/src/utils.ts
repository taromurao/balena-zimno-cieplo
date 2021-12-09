import { baseLogger } from './logging';

const logger = baseLogger.child({ module: 'utils' });

export async function sleep(ms: number) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}