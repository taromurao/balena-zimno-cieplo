import {
    DISTANCE_TORRELANCE,
    MQTT_DISTANCE_TOPIC,
    VERY_CLOSE_DISTANCE
} from './consts';
import { baseLogger } from './logging';
import { Message } from './message';
import { Distance } from './distance';
import { client } from './mqtt';
import { tell } from './tell';

const logger = baseLogger.child({ module: 'index' });

function absoluteDiff(x: number, y: number): number {
    return Math.abs(x - y);
}

function zimnoCieplo(distance: Distance): void {
    const { current, previous } = distance;
    logger.info(`Current distance: ${current} m`);

    if (current) {
        if (current <= VERY_CLOSE_DISTANCE) {
            tell(Message.VERY_CLOSE);
        } else {
            if (absoluteDiff(previous, current) < DISTANCE_TORRELANCE) {
                tell(Message.NOTHING);
            } else {
                if (!previous || current <= previous) {
                    tell(Message.NEARING);
                } else {
                    tell(Message.GETTING_FARTHER)
                }
            }
        }
    } else {
        tell(Message.NOT_FOUND);
    }
};

client.on('message', (topic, message) => {
    try {
        const distance = JSON.parse(message.toString());
        zimnoCieplo(distance);
    } catch (error) {
        logger.error(error);
    }
});

client.on('connect', () => {
    client.subscribe(MQTT_DISTANCE_TOPIC, error => { });
});

tell(Message.STARTING);
