import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { getReadings } from './utils';
import {
    BEACON_UUID,
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

async function zimnoCieplo(previousDistance?: number): Promise<never> {
    await exec(`truncate -s 0 ${SCAN_OUT}`)
    const scanResult = await fs.readFile(SCAN_OUT, 'utf-8');
    const signalStrengths = getReadings(scanResult);
    const rssi = signalStrengths.find(x => x.uuid = BEACON_UUID)?.rssi;
    const currentDistance = rssi ? 1 / ( rssi / TX_POWER) : undefined;

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

    await sleep(SLEEP_DURATION);
    return await zimnoCieplo(currentDistance);
};

(async () => {
    logger.info(STARTING);
    await zimnoCieplo();
})();