import * as winston from 'winston';

const { combine, timestamp, json } = winston.format;

export const baseLogger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ],
    format: combine(
        json(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    ),
});