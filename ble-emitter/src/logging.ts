import * as winston from 'winston';

const { colorize, combine, metadata, timestamp, printf, splat } = winston.format;

export const baseLogger = winston.createLogger({
    level: process.env.LOG_LEVEL,
    transports: [
        new winston.transports.Console()
    ],
    format: combine(
        colorize(),
        splat(),
        metadata(),
        timestamp(),
        printf(({ timestamp, level, message, metadata }) => {
            return `[${timestamp}] ${level}: ${message}. ${JSON.stringify(metadata)}`;
        })
    ),
});