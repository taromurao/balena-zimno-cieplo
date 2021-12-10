// const mqtt = require('mqtt')
import * as mqtt from 'mqtt'
import { MQTT_SERVER_URL } from './consts';
import { baseLogger } from './logging';

const logger = baseLogger.child({ module: 'mqtt' });

// Connection option
const options = {
    clean: true, // Retain connection
    connectTimeout: 4000, // Timeout
    clientId: 'ble-emitter',
};

// Workaround: TypeScript compile freaks out without ts-ignore on RPi
// @ts-ignore
export const client = mqtt.connect(MQTT_SERVER_URL, options);

client.on('reconnect', (error) => {
    logger.error('reconnect:', error);
})
