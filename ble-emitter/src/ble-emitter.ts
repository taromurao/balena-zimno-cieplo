import { BehaviorSubject } from 'rxjs';
import { filter, map, scan, tap } from 'rxjs/operators';
import { Tail } from 'tail';
import * as path from 'path';

import { BEACON_UUID, RSSI_ENTRY_LINES, SCAN_OUT } from './consts';
import { baseLogger } from './logging';
import { sleep } from './utils';

const logger = baseLogger.child({ module: 'BleEmitter' });

export class BleEmitter {
    beaconUUID: string = BEACON_UUID;
    tail = new Tail(path.join('/var', 'ble-emitter', SCAN_OUT));
    $btmonLines: BehaviorSubject<string> = new BehaviorSubject('');

    async start() {
        logger.info('Starting BLE Emitter service...');

        this.$btmonLines
            .pipe(
                takeLastN(RSSI_ENTRY_LINES),
                map(getRSSI),
                filter(isNotNull),
                filter(uuidMatches),
                map(({ rssi }) => rssi),
            )
            .subscribe(logger.info);

        this.tail.on("line", (data: string) => {
            this.$btmonLines.next(data);
        });

        this.tail.on("error", function (error: any) {
            logger.error(`${error}`);
        });

        while (true) {
            await sleep(5000);
        }
    }
}

function takeLastN(n: number) {
    return scan((acc: Array<string>, val: string) => {
        acc.push(val);
        return acc.slice(-n);
    }, [])
}

function isNotNull(x: any) {
    return !(x === null);
}

function uuidMatches(rssi: RSSI): boolean {
    return rssi.uuid === BEACON_UUID;
}

interface RSSI {
    uuid: string;
    rssi: number;
}

/**
 * 
 * @param lines
 * @returns RSSI
 * 
 * Typical RSSI reading looks like follows:
 * > HCI Event: LE Meta Event (0x3e) plen 39               #2003 [hci0] 874.563215
 *     LE Advertising Report (0x02)
 *       Num reports: 1
 *       Event type: Scannable undirected - ADV_SCAN_IND (0x02)
 *       Address type: Random (0x01)
 *       Address: 48:76:78:6D:58:AC (Resolvable)
 *       Data length: 27
 *       Company: Apple, Inc. (76)
 *         Type: iBeacon (2)
 *         UUID: 4945d64b-57aa-cdb8-8b48-c487a2163f86
 *         Version: 0.0
 *         TX power: -65 dB
 *       RSSI: -76 dBm (0xb4)
 */
function getRSSI(lines: ReadonlyArray<string>): RSSI | null {
    if (lines.length == RSSI_ENTRY_LINES) {
        if (lastContainsRSSI(lines)) {
            const uuid = getUUID(lines);
            const rssi = getRSSIValue(lines);

            if (uuid && rssi) {
                return { uuid, rssi };
            }
        }
    }
    return null;
}

function lastContainsRSSI(lines: ReadonlyArray<string>): boolean {
    const lastLine = lines[lines.length - 1];
    return /RSSI: /.exec(lastLine) ? true : false;
}

function getRSSIValue(lines: ReadonlyArray<string>): number | null {
    const line = lines[lines.length - 1].trim();
    try {
        const rssi = parseInt(line.split(' ')[1]);
        return rssi === NaN ? null : rssi;
    } catch {
        return null;
    }
}

function getUUID(lines: ReadonlyArray<string>): string | null {
    const line = lines[2].trim();
    try {
        return line.split(' ')[1];
    } catch {
        return null;
    }

}