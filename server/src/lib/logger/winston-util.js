import _ from 'lodash';
import { logger } from './winston-config';

const loggerUtil = {

    logMsg: (level, context, address, message, details) => {
        logger.log({
            level: _.isEmpty(level) ? ' ' : level,
            address: _.isEmpty(address) ? '' : address,
            context: _.isEmpty(context) ? '' : context,
            message: _.isEmpty(message) ? '' : message,
            details: _.isEmpty(details) ? '' : details,
        });
    },
    logInfo: (context, address, message) => {
        logger.log({
            level: 'info',
            address: _.isEmpty(address) ? '' : address,
            context: _.isEmpty(context) ? '' : context,
            message: _.isEmpty(message) ? '' : message,
            details: '',
        });
    },
    logInfoWithDetails: (context, address, message, details) => {
        logger.log({
            level: 'info',
            address: _.isEmpty(address) ? '' : address,
            context: _.isEmpty(context) ? '' : context,
            message: _.isEmpty(message) ? '' : message,
            details: _.isEmpty(details) ? '' : details,
        });
    },
    logInfoInternal: (context, message) => {
        logger.log({
            level: 'info',
            address: 'INTERNAL',
            context: _.isEmpty(context) ? '' : context,
            message: _.isEmpty(message) ? '' : message,
            details: '',
        });
    },
    logErrorInternal: (context, message, details) => {
        logger.log({
            level: 'error',
            address: 'INTERNAL',
            context: _.isEmpty(context) ? '' : context,
            message: _.isEmpty(message) ? '' : message,
            details: _.isEmpty(details) ? '' : details,
        });
    },
    logError: (context, address, message) => {
        logger.log({
            level: 'error',
            address: _.isEmpty(address) ? '' : address,
            context: _.isEmpty(context) ? '' : context,
            message: _.isEmpty(message) ? '' : message,
            details: '',
        });
    },
    logErrorWithDetails: (context, address, message, details) => {
        logger.log({
            level: 'error',
            address: _.isEmpty(address) ? '' : address,
            context: _.isEmpty(context) ? '' : context,
            message: _.isEmpty(message) ? '' : message,
            details: _.isEmpty(details) ? '' : details,
        });
    },

};

export default loggerUtil;
