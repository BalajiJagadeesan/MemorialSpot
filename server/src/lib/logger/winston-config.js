import winston from 'winston';
import moment from 'moment';
import _ from 'lodash';

const {
    combine, timestamp, prettyPrint, printf,
} = winston.format;


const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        verbose: 3,
        debug: 4,
        silly: 5,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'blue',
        verbose: 'green',
        debug: 'purple',
        silly: 'orange',
    },
};

const customFormat = printf((info) => {
    const ts = moment(info.timestamp).format('YYYY-MM-DD HH:mm:ss Z');
    if (_.isEmpty(info.details)) {
        return `${ts} //[${info.context}]// [${info.level}]: *${info.address}*  ${info.message}`;
    }
    return `${ts} //[${info.context}]// [${info.level}]: *${info.address}* ${info.message} \n ${info.details}`;
});

const formatParams = combine(
    winston.format.colorize(),
    prettyPrint(),
    timestamp(),
    customFormat,
);
const transports = {
    console: new winston.transports.Console({
        name: 'console',
        level: 'info',
    }),
    file: new winston.transports.File({
        name: 'all',
        filename: './logs/combined.log',
        level: 'info',
        format: combine(prettyPrint(), winston.format.json()),
    }),
    error: new winston.transports.File({
        name: 'error',
        filename: './logs/error.log',
        level: 'error',
        format: combine(prettyPrint(), winston.format.json()),
    }),
    exception: new winston.transports.File({
        name: 'exception',
        filename: './logs/exceptions.log',
        format: combine(prettyPrint(), winston.format.json()),
    }),
};

const logger = winston.createLogger({
    level: 'info',
    levels: customLevels.levels,
    format: formatParams,
    transports: [
        transports.console,
        transports.file,
        transports.error,
    ],
    exceptionHandlers: [transports.exception],
});

winston.addColors(customLevels);

export { transports, logger };
