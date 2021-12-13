
import { promises as fs } from 'fs';
import * as path from 'path';
import * as utils from './utils';

// describe('getReadings', () => {
//     it('reads rssi values', async () => {
//         const data = await fs.readFile(path.join(__dirname, '..', 'test', 'data', 'scan.txt'), 'utf-8');
//         const readings = utils.getReadings(data);
//         const rssi = readings.find(x => x.uuid === BEACON_UUID)?.slice(-1)[0];
//         expect(rssi).toStrictEqual(-73);
//     });
// });