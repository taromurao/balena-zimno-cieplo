import { BleEmitter } from './ble-emitter';
import { sleep } from './utils';

(async () => {
    await (new BleEmitter()).start();
    while (true) {
        await sleep(10000);
    }
})();