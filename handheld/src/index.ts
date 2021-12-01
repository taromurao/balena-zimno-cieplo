import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { getReadings } from './utils';
import {
    BEACON_UUID,
    ENVIRONMENTAL_FACTOR,
    SCAN_OUT,
    SLEEP_DURATION,
    STARTING,
    TX_POWER,
    VERY_CLOSE_DISTANCE
} from './consts';
import { baseLogger } from './logging';
import { Message } from './message';

const logger = baseLogger.child({ module: 'index' });

async function sleep(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

function tell(msg: Message) {
    logger.info(msg);
}

function average(xs: ReadonlyArray<number>): number {
    return xs.reduce((acc, x) => (acc + x), 0) / xs.length;
}

function getDistance(rssis: ReadonlyArray<number>): number | undefined {
    if (rssis.length === 0) {
        return undefined;
    } else {
        const ratio = average(rssis) / TX_POWER;
        return ratio < 1 ?
            Math.pow(ratio, 10) :
            0.89976 * Math.pow(ratio, 7.7095) + 0.111;
    }
}

async function zimnoCieplo(previousDistance?: number): Promise<never> {
    await sleep(SLEEP_DURATION);
    const scanResult = await fs.readFile(SCAN_OUT, 'utf-8');
    const signalStrengths = getReadings(scanResult);
    const rssis = signalStrengths.filter(x => x.uuid == BEACON_UUID).map(x => x.rssi);
    const currentDistance: number | undefined = getDistance(rssis);
    logger.info(`Current distance: ${currentDistance}m`);

    if (currentDistance) {
        if (currentDistance <= VERY_CLOSE_DISTANCE) {
            tell(Message.VERY_CLOSE);
        } else {
            if (!previousDistance || currentDistance <= previousDistance) {
                tell(Message.NEARING);
            } else {
                tell(Message.GETTING_FARTHER)
            }
        }
    } else {
        tell(Message.NOT_FOUND);
    }

    await exec(`truncate -s 0 ${SCAN_OUT}`)
    return await zimnoCieplo(currentDistance);
};

(async () => {
    logger.info(STARTING);
    await zimnoCieplo();
})();
return xs.reduce((acc, x) => (acc + x), 0) / xs.length;