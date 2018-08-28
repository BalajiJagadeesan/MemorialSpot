import requestIp from 'request-ip';
import _ from 'lodash';
import * as shortid from 'shortid';
import EditsDB from '../database/models/EditsDB';
import loggerUtil from '../lib/logger/winston-util';
import hasScope from '../controllers/scopes';
import { info, MongoError, ValidationError } from '../lib/errors/CustomErrors';
import Validator from '../lib/ValidatorClass';
import editParser from '../lib/parsers/edits-parser';
import DeceasedDB from '../database/models/DeceasedDB';


const resolvers = {
    Query: {
        getEditsById: async (root, args, context) => {
            const ip = requestIp.getClientIp(context);
            const typeChecker = new Validator();
            try {
                const decodedJWT = await hasScope(context, ['client:read', 'admin:read']);
                loggerUtil.logInfo('QUERY', ip, 'Invoked query getEditsById');
                const cleanedID = typeChecker.analyseID(args.id);
                if (!_.isEmpty(typeChecker.errors)) {
                    const errorID = shortid.generate();
                    loggerUtil.logErrorWithDetails('Validation Error', ip, `ErrorID: ${errorID}`, `MSG ====> ${typeChecker.errors}`);
                    return new ValidationError(info(errorID, 1550, typeChecker.errors));
                }
                loggerUtil.logInfo('QUERY', ip, 'Served endpoint getEditsById');
                return await EditsDB.findOne({ _id: cleanedID });
            } catch (err) {
                throw err;
            }
        },
        getEdits: async (root, { limit, offset }, context) => {
            const ip = requestIp.getClientIp(context);
            try {
                const decodedJWT = await hasScope(context, ['client:read', 'admin:read']);
                loggerUtil.logInfo('QUERY', ip, 'Served endpoint getEdits');
                return await EditsDB.find({ archive: false }).sort({ createdAt: 1 })
                    .limit(limit).skip(offset);
            } catch (err) {
                throw err;
            }
        },
        getArchive: async (root, { limit, offset }, context) => {
            const ip = requestIp.getClientIp(context);
            try {
                const decodedJWT = await hasScope(context, ['client:read', 'admin:read']);
                loggerUtil.logInfo('QUERY', ip, 'Served endpoint getArchive');
                return await EditsDB.find({ archive: true }).sort({ createdAt: 1, archive: true })
                    .limit(limit).skip(offset);
            } catch (err) {
                throw err;
            }
        },
        getEditsByType: async (root, { type, limit, offset }, context) => {
            const ip = requestIp.getClientIp(context);
            const typeChecker = new Validator();
            try {
                const decodedJWT = await hasScope(context, ['client:read', 'admin:read']);
                loggerUtil.logInfo('QUERY', ip, 'Invoked query getEditsByType');
                const cleanedType = typeChecker.analyseEditType(type);
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
                loggerUtil.logInfo('QUERY', ip, 'Served endpoint getEditsByType');
                return await EditsDB.find({ nameOfEntry: cleanedType, archive: false })
                    .limit(limit).skip(offset);
            } catch (err) {
                throw err;
            }
        },
    },
    Mutation: {
        createEdits: async (root, { data }, context) => {
            const ip = requestIp.getClientIp(context);
            try {
                const decodedJWT = await hasScope(context, ['client:create', 'admin:create']);
                loggerUtil.logInfo('MUTATION', ip, 'Invoked mutation createEdits');
                const newEntry = await editParser.newItem(data);
                return await new EditsDB(newEntry).save();
            } catch (err) {
                throw err;
            }
        },
        archiveEdit: async (root, { data }, context) => {
            const ip = requestIp.getClientIp(context);
            const typeChecker = new Validator();
            try {
                const decodedJWT = await hasScope(context, ['client:create', 'admin:create']);
                loggerUtil.logInfo('MUTATION', ip, 'Invoked mutation archiveEdit');
                const cleanedID = typeChecker.analyseID(data.id);
                if (!_.isEmpty(typeChecker.errors)) {
                    const errorID = shortid.generate();
                    loggerUtil.logErrorWithDetails('Validation Error', ip, `ErrorID: ${errorID}`, `MSG ====> ${typeChecker.errors}`);
                    return new ValidationError(info(errorID, 1550, typeChecker.errors));
                }
                return await DeceasedDB.findOneAndUpdate({ _id: cleanedID }, { archive: true }, {
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
    },
};

export default resolvers;
