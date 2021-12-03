import {baseLogger} from './logging';

const logger = baseLogger.child({ module: 'utils' });

export function getReadings(scanResult: string) {
    const lines = scanResult.split(/\r\n|\n/);
    let address;
    let uuid;
    let rssi;
    let readings = [];

    lines.forEach(l => {
        const line = l.trim();
        if (/Address: [\dA-Z]{2}:[\dA-Z]{2}:[\dA-Z]{2}:[\dA-Z]{2}:[\dA-Z]{2}:[\dA-Z]{2}/.exec(line)) {
            address = line.split(' ')[1];
        }
        else if (/UUID:/.exec(line)) {
            uuid = line.split(' ')[1];
        }
        else if (/RSSI: /.exec(line)) {
            rssi = parseInt(line.split(' ')[1]);
            if (address && uuid && rssi) {
                readings.push({
                    address,
                    uuid,
                    rssi
                });
            }
            address = uuid = rssi = undefined;
        }
    });

    return readings;
}