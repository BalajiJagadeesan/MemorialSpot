import requestIp from 'request-ip';
import _ from 'lodash';
import * as shortid from 'shortid';

import loggerUtil from '../lib/logger/winston-util';
import hasScope from '../controllers/scopes';
import { info, MongoError, NotAuthorized, ValidationError } from '../lib/errors/CustomErrors';
import Validator from '../lib/ValidatorClass';
import MemoryDB from '../database/models/MemoryDB';
import DeceasedDB from '../database/models/DeceasedDB';
import LocationDB from '../database/models/LocationDB';
import AdminDB from '../database/models/AdminDB';
import memoryParser from '../lib/parsers/memory-parser';


const resolvers = {
    Query: {
        getMemoryByType: async (root, { type, limit, offset }, context) => {
            const ip = requestIp.getClientIp(context);
            const typeChecker = new Validator();
            try {
                const decodedJWT = await hasScope(context, ['client:read', 'admin:read']);
                loggerUtil.logInfo('QUERY', ip, 'Invoked query getMemoryByType');
                const cleanedType = typeChecker.analyseMemoryType(type);
                if (!_.isEmpty(typeChecker.errors)) {
                    const errorID = shortid.generate();
                    loggerUtil.logErrorWithDetails(
                        'Validation Error',
                        ip,
                        `ErrorID: ${errorID}`,
                        `MSG ====> ${typeChecker.errors}`,
                    );
                    return new ValidationError(info(errorID, 1550, typeChecker.errors));
                }
                loggerUtil.logInfo('QUERY', ip, 'Served endpoint getMemoryByType');
                return await MemoryDB.find({ memoryType: cleanedType })
                    .limit(limit).skip(offset);
            } catch (err) {
                throw err;
            }
        },
        getUnVerfiedMemorials: async (root, { limit, offset }, context) => {
            try {
                const decodedJWT = await hasScope(context, ['admin:read']);
                return await MemoryDB.find({ isVerified: false }).limit(limit).skip(offset);
            } catch (err) {
                throw err;
            }
        },
        getMemoryById: async (root, args, context) => {
            const ip = requestIp.getClientIp(context);
            const typeChecker = new Validator();
            try {
                const decodedJWT = await hasScope(context, ['client:read', 'admin:read']);
                loggerUtil.logInfo('QUERY', ip, 'Invoked query getMemoryById');
                const cleanedID = typeChecker.analyseID(args.id);
                if (!_.isEmpty(typeChecker.errors)) {
                    const errorID = shortid.generate();
                    loggerUtil.logErrorWithDetails('Validation Error', ip, `ErrorID: ${errorID}`, `MSG ====> ${typeChecker.errors}`);
                    return new ValidationError(info(errorID, 1550, typeChecker.errors));
                }
                loggerUtil.logInfo('QUERY', ip, 'Served endpoint getMemoryById');
                return await MemoryDB.findOne({ _id: cleanedID });
            } catch (err) {
                throw err;
            }
        },
    },
    Memory: {
        deceasedPerson: async memory => DeceasedDB.findOne({ _id: memory.deceasedID }),
        location: async ({ _id }) => (LocationDB.findOne({ memoryID: _id })),
        verifiedBy: async (memory) => {
            if (memory.isVerified === true && memory.verifiedBy) {
                return AdminDB.findOne({ _id: memory.verifiedBy });
            }
            return null;
        },
    },
    Mutation: {
        createMemory: async (root, { data }, context) => {
            const ip = requestIp.getClientIp(context);
            try {
                const decodedJWT = await hasScope(context, ['client:create', 'admin:create']);
                loggerUtil.logInfo('MUTATION', ip, 'Invoked mutation createMemory');
                const newEntry = await memoryParser.newItem(data);
                return await new MemoryDB(newEntry).save();
            } catch (err) {
                throw err;
            }
        },
        editMemory: async (root, { data }, context) => {
            const ip = requestIp.getClientIp(context);
            try {
                const decodedJWT = await hasScope(context, ['admin:edit']);
                loggerUtil.logInfo('MUTATION', ip, 'Invoked mutation editMemory');
                const editEntry = await memoryParser.editItem(data);
                return await MemoryDB.findOneAndUpdate({ _id: editEntry.id }, editEntry, {
                    new: true,
                    runValidators: true,
                }).exec().then(content => content).catch((err) => {
                    const errorID = shortid.generate();
                    loggerUtil.logErrorWithDetails('MONGO_ERROR', ip, `ErrorID: ${errorID}`, `MSG ====> ${err}`);
                    return new MongoError(info(errorID, 1000, 'Error in executing query'));
                });
            } catch (err) {
                throw err;
            }
        },
        verifyMemory: async (root, { id }, context) => {
            const ip = requestIp.getClientIp(context);
            try {
                const decodedJWT = await hasScope(context, ['admin:edit']);
                loggerUtil.logInfo('MUTATION', ip, 'Invoked mutation verifyDeceasedPerson');
                const currentAdmin = await AdminDB.findOne({ emailID: decodedJWT.emailID });
                if (!_.isEmpty(currentAdmin)) {
                    const obj = {
                        verifiedBy: currentAdmin._id,
                        isVerified: true,
                    };
                    return await MemoryDB.findOneAndUpdate({ _id: id }, obj, {
                        new: true,
                        runValidators: true,
                    }).exec().then(content => content).catch((err) => {
                        const errorID = shortid.generate();
                        loggerUtil.logErrorWithDetails('MONGO_ERROR', ip, `ErrorID: ${errorID}`, `MSG ====> ${err}`);
                        return new MongoError(info(errorID, 1000, 'Error in executing query'));
                    });
                }
                const errorID = shortid.generate();
                loggerUtil.logErrorWithDetails('NotAuthorized', ip, 'admin not found in db');
                return new NotAuthorized(info(errorID, 1500, 'Admin not found in database'));
            } catch (err) {
                throw err;
            }
        },
    },

};


export default resolvers;

