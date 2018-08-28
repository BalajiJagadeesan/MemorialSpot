import requestIp from 'request-ip';
import _ from 'lodash';
import * as shortid from 'shortid';
import DeceasedDB from '../database/models/DeceasedDB';
import MemoryDB from '../database/models/MemoryDB';
import NotesDB from '../database/models/NotesDB';
import AdminDB from '../database/models/AdminDB';
import loggerUtil from '../lib/logger/winston-util';
import hasScope from '../controllers/scopes';
import { info, InvalidQueryParameter, MongoError, NotAuthorized, ValidationError } from '../lib/errors/CustomErrors';
import deceasedParser from '../lib/parsers/deceased-parser';
import Validator from '../lib/ValidatorClass';

const resolvers = {
    Query: {
        getDeceasedById: async (root, args, context) => {
            const ip = requestIp.getClientIp(context);
            const typeChecker = new Validator();
            try {
                const decodedJWT = await hasScope(context, ['client:read', 'admin:read']);
                loggerUtil.logInfo('QUERY', ip, 'Invoked query getDeceasedById');
                const cleanedID = typeChecker.analyseID(args.id);
                if (!_.isEmpty(typeChecker.errors)) {
                    const errorID = shortid.generate();
                    loggerUtil.logErrorWithDetails('Validation Error', ip, `ErrorID: ${errorID}`, `MSG ====> ${typeChecker.errors}`);
                    return new ValidationError(info(errorID, 1550, typeChecker.errors));
                }
                loggerUtil.logInfo('QUERY', ip, 'Served endpoint getDeceasedById');
                return await DeceasedDB.findOne({ _id: cleanedID });
            } catch (err) {
                throw err;
            }
        },
        getUnVerfiedDeceasedPerson: async (root, { limit, offset }, context) => {
            try {
                const decodedJWT = await hasScope(context, ['admin:read']);
                return await DeceasedDB.find({ isVerified: false }).limit(limit).skip(offset);
            } catch (err) {
                throw err;
            }
        },
        getDeceasedByName: async (root, {
            firstName, lastName, limit, offset,
        }, context) => {
            const ip = requestIp.getClientIp(context);
            const typeChecker = new Validator();
            try {
                const errors = [];
                loggerUtil.logInfo('QUERY', ip, 'Invoked query getDeceasedByName');
                const decodedJWT = await hasScope(context, ['client:read', 'admin:read']);
                if (firstName && lastName) {
                    const fName = typeChecker.analyseSearchTerm(firstName);
                    const lName = typeChecker.analyseSearchTerm(lastName);
                    if (!_.isEmpty(typeChecker.errors)) {
                        const errorID = shortid.generate();
                        loggerUtil.logErrorWithDetails('Validation Error', ip, `ErrorID: ${errorID}`, `MSG ====> ${typeChecker.errors}`);
                        return new ValidationError(info(errorID, 1550, typeChecker.errors));
                    }
                    return await DeceasedDB.find({
                        $or: [
                            { firstName: new RegExp(`^${fName}`, 'i') },
                            { lastName: new RegExp(`^${lName}`, 'i') },
                        ],
                    }).limit(limit).skip(offset);
                } else if (firstName) {
                    const fName = typeChecker.analyseSearchTerm(firstName);
                    if (!_.isEmpty(typeChecker.errors)) {
                        errors.push(`firstName - ${typeChecker.errors}`);
                    }
                    if (!_.isEmpty(errors)) {
                        const errorID = shortid.generate();
                        loggerUtil.logErrorWithDetails('Validation Error', ip, `ErrorID: ${errorID}`, `MSG ====> ${errors}`);
                        return new ValidationError(info(errorID, 1550, errors));
                    }
                    return await DeceasedDB.find({ firstName: new RegExp(`^${fName}`, 'i') })
                        .limit(limit)
                        .skip(offset);
                } else if (lastName) {
                    const lName = typeChecker.analyseSearchTerm(lastName);
                    if (!_.isEmpty(typeChecker.errors)) {
                        errors.push(`lastName - ${typeChecker.errors}`);
                    }
                    if (!_.isEmpty(errors)) {
                        const errorID = shortid.generate();
                        loggerUtil.logErrorWithDetails('Validation Error', ip, `ErrorID: ${errorID}`, `MSG ====> ${errors}`);
                        return new ValidationError(info(errorID, 1550, errors));
                    }
                    return await DeceasedDB.find({ lastName: new RegExp(`^${lName}`, 'i') })
                        .limit(limit)
                        .skip(offset);
                }
                const errorID = shortid.generate();
                loggerUtil.logErrorWithDetails('InvalidQueryParameter Error', ip, `ErrorID: ${errorID}`, `MSG ====> ${errors}`);
                return new InvalidQueryParameter(info(errorID, 1501, 'firstName or lastName should be provided'));
            } catch (err) {
                throw err;
            }
        },
    },
    Deceased: {
        memories: async ({ _id }) => (MemoryDB.find({ deceasedID: _id })),
        personalNote: async ({ _id }) => (NotesDB.find({ deceasedID: _id })),
        verifiedBy: async (deceased) => {
            if (deceased.isVerified === true && deceased.verifiedBy) {
                return AdminDB.findOne({ _id: deceased.verifiedBy });
            }
            return null;
        },
    },
    Mutation: {
        createDeceasedPerson: async (root, { data }, context) => {
            const ip = requestIp.getClientIp(context);
            try {
                const decodedJWT = await hasScope(context, ['client:create', 'admin:create']);
                loggerUtil.logInfo('MUTATION', ip, 'Invoked mutation createDeceasedPerson');
                const newEntry = await deceasedParser.newItem(data);
                return await new DeceasedDB(newEntry).save();
            } catch (err) {
                throw err;
            }
        },
        editDeceasedPerson: async (root, { data }, context) => {
            const ip = requestIp.getClientIp(context);
            try {
                const decodedJWT = await hasScope(context, ['admin:edit']);
                loggerUtil.logInfo('MUTATION', ip, 'Invoked mutation editDeceasedPerson');
                const editEntry = await deceasedParser.editItem(data);
                return await DeceasedDB.findOneAndUpdate({ _id: editEntry.id }, editEntry, {
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
        verifyDeceasedPerson: async (root, { id }, context) => {
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
                    return await DeceasedDB.findOneAndUpdate({ _id: id }, obj, {
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
