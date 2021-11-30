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

function getDistance(rssis: ReadonlyArray<number>): number {
    const avrgRssi = rssis.reduce((acc, x) => (acc + x) / rssis.length, 0);
    return Math.exp((TX_POWER - avrgRssi) / 10 / ENVIRONMENTAL_FACTOR);
}

async function zimnoCieplo(previousDistance?: number): Promise<never> {
    await sleep(SLEEP_DURATION);
    const scanResult = await fs.readFile(SCAN_OUT, 'utf-8');
    const signalStrengths = getReadings(scanResult);
    const rssis = signalStrengths.find(x => x.uuid = BEACON_UUID)?.map(x => x.rssi);
    const currentDistance = rssis.length > 0 ? getDistance(rssis) : undefined;
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
