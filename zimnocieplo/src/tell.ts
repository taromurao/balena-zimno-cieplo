import { exec } from 'child_process';
import * as path from 'path';
import { baseLogger } from './logging';
import { Message } from './message';

const logger = baseLogger.child({ module: 'tell' });

const cieplo = path.join(__dirname, '..', 'audio', 'cieplo.wav');
const zimno = path.join(__dirname, '..', 'audio', 'zimno.wav');
const bell = path.join(__dirname, '..', 'audio', 'bell.wav');

export function tell(message: Message): void {
    switch (message) {
        case Message.NEARING:
            exec(`play ${cieplo}`);
            break;
        case Message.VERY_CLOSE:
            exec(`play ${cieplo}`, (err, stdout, stderr) => {
                exec(`play ${cieplo}`);
            });
            break;
        case Message.GETTING_FARTHER:
            exec(`play ${zimno}`);
            break;
        case Message.NOT_FOUND:
            exec(`play ${zimno}`, (err, stdout, stderr) => {
                exec(`play ${zimno}`);
            });
            break;
        case Message.STARTING:
            exec(`play ${bell}`);
            break;
        default:
            logger.info(message);
            break;
    }
}