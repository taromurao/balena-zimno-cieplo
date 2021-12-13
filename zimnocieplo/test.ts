import { exec } from 'child_process';
import * as path from 'path';

async function sleep(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

async function test() {
    const cieplo = path.join(__dirname, 'audio', 'cieplo.wav');
    const zimno = path.join(__dirname, 'audio', 'zimno.wav');
    exec(`play ${cieplo}`, (err, stdout, stderr) => {
        exec(`play ${cieplo}`);
    });
    // await exec(`play ${zimno}`);
}

(async () => {
    await test();
})();