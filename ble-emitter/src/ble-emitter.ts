import { BehaviorSubject, Observable } from 'rxjs';
import {
    bufferTime,
    filter,
    map,
    pairwise,
    scan,
    startWith,
    tap,
    withLatestFrom
} from 'rxjs/operators';
import { Tail } from 'tail';
import * as path from 'path';
import { kFilter } from './k-filter';

import {
    BEACON_UUID,
    EMISSION_INTERVAL,
    MQTT_DISTANCE_TOPIC,
    RSSI_ENTRY_LINES,
    SCAN_OUT,
    TX_POWER,
} from './consts';
import { baseLogger } from './logging';
import { sleep } from './utils';
import { Distance } from './distance';
import { client } from './mqtt';

const logger = baseLogger.child({ module: 'BleEmitter' });

export class BleEmitter {
    beaconUUID: string = BEACON_UUID;
    tail = new Tail(path.join('/var', 'ble-emitter', SCAN_OUT));
    mqttClient;

    constructor() {
        this.mqttClient = client;
        this.mqttClient.on('connect', () => {
            this.mqttClient.subscribe(MQTT_DISTANCE_TOPIC, error => { });
        });
    }

    async start() {
        logger.info('Starting BLE Emitter service...');

        $emitWithInterval.subscribe(x => {
            logger.info(`Current distance is ${x.current} m.`);
            this.mqttClient.publish(MQTT_DISTANCE_TOPIC, JSON.stringify(x));
        });

        this.tail.on("line", (data: string) => {
            $btmonLines.next(data);
        });

        this.tail.on("error", function (error: any) {
            logger.error(`${error}`);
        });

        while (true) {
            await sleep(5000);
        }
    }
}

const $btmonLines: BehaviorSubject<string> = new BehaviorSubject('');

const $observation = $btmonLines
    .pipe(
        takeLastN(RSSI_ENTRY_LINES),
        map(getRSSI),
        filter(isNotNullOrUndefined),
        filter(uuidMatches),
        map(({ rssi }) => rssi),
    )

const $estimate: BehaviorSubject<any> = new BehaviorSubject(null);

const $distance: Observable<number> = $estimate
    .pipe(
        filter(isNotNullOrUndefined),
        map(x => x.mean[0][0]),
        map(getDistance),
    )

const $emitWithInterval: Observable<Distance> = $distance
    .pipe(
        bufferTime(EMISSION_INTERVAL),
        map(takeLast),
        startWith(null),
        pairwise(),
        map(([previous, current]) => ({
            type: 'BLE',
            previous,
            current
        }))
    );

$observation
    .pipe(
        withLatestFrom($estimate),
        map(([observation, previousCorrected]) =>
            kFilter.filter({ previousCorrected, observation })),
        tap(x => $estimate.next(x)),
    )
    .subscribe();

function takeLast(xs: ReadonlyArray<number>): number | null {
    return xs.length > 0 ? xs[xs.length - 1] : null;
}

function takeLastN(n: number) {
    return scan((acc: Array<string>, val: string) => {
        acc.push(val);
        return acc.slice(-n);
    }, [])
}

function isNotNullOrUndefined(x: any) {
    return !(x === null || x === undefined);
}

function uuidMatches(rssi: RSSI): boolean {
    return rssi.uuid === BEACON_UUID;
}

interface RSSI {
    uuid: string;
    rssi: number;
}

function getDistance(rssi: number): number {
    const diff = TX_POWER - rssi;
    return diff <= 0 ?
        1 : Math.sqrt(diff) + 1;
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