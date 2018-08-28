import mongoose from 'mongoose';
import loggerUtil from '../lib/logger/winston-util';


mongoose.Promise = global.Promise;

const options = {
    socketTimeoutMS: 0,
    keepAlive: true,
    reconnectTries: 30,
};

/**
 * Connect to the MongoDB Server
 */

let dbName;
if (process.env.NODE_ENV === 'production') {
    dbName = process.env.MLAB_TEST;
} else if (process.env.NODE_ENV === 'development') {
    dbName = process.env.LOCAL_DATABASE_DEV;
} else {
    dbName = process.env.LOCAL_DATABASE_TEST;
}
mongoose.connect(dbName, options, (error) => {
    if (error) {
        loggerUtil.logErrorInternal('MONGO_ERROR', 'Here Error in connecting to the mongoDB Server', error);
    } else {
        loggerUtil.logInfoInternal('MONGO_SERVER', 'Connected to the MongoDB Server');
    }
});

/**
 * When the connection is disconnected
 */
mongoose.connection.on('disconnected', () => {
    loggerUtil.logInfoInternal('MONGO_SERVER', 'Mongoose default connection disconnected');
});

/**
 * If the Node process ends, close the Mongoose connection
 */
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        loggerUtil.logInfoInternal('MONGO_SERVER', 'Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

