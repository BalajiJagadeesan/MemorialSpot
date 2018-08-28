import requestIp from 'request-ip';
import _ from 'lodash';
import * as shortid from 'shortid';
import DeceasedDB from '../database/models/DeceasedDB';
import NotesDB from '../database/models/NotesDB';
import loggerUtil from '../lib/logger/winston-util';
import hasScope from '../controllers/scopes';
import { info, ValidationError } from '../lib/errors/CustomErrors';
import noteParser from '../lib/parsers/notes-parser';
import Validator from '../lib/ValidatorClass';

const resolvers = {

    Query: {
        getNotesById: async (root, args, context) => {
            const ip = requestIp.getClientIp(context);
            const typeChecker = new Validator();
            try {
                const decodedJWT = await hasScope(context, ['client:read', 'admin:read']);
                loggerUtil.logInfo('QUERY', ip, 'Invoked query getNotesById');
                const cleanedID = typeChecker.analyseID(args.id);
                if (!_.isEmpty(typeChecker.errors)) {
                    const errorID = shortid.generate();
                    loggerUtil.logErrorWithDetails('Validation Error', ip, `ErrorID: ${errorID}`, `MSG ====> ${typeChecker.errors}`);
                    return new ValidationError(info(errorID, 1550, typeChecker.errors));
                }
                loggerUtil.logInfo('QUERY', ip, 'Served endpoint getNotesById');
                return await NotesDB.findOne({ _id: cleanedID });
            } catch (err) {
                throw err;
            }
        },
        getNotes: async (root, { limit, offset }, context) => {
            const ip = requestIp.getClientIp(context);
            try {
                const decodedJWT = await hasScope(context, ['client:read', 'admin:read']);
                loggerUtil.logInfo('QUERY', ip, 'Served endpoint getNotes');
                return await NotesDB.find().sort({ createdAt: 1 }).limit(limit).skip(offset);
            } catch (err) {
                throw err;
            }
        },
    },
    Note: {
        deceasedPerson: note => DeceasedDB.findOne({ _id: note.deceasedID }),
    },
    Mutation: {
        createANote: async (root, { data }, context) => {
            const ip = requestIp.getClientIp(context);
            try {
                const decodedJWT = await hasScope(context, ['client:create', 'admin:create']);
                loggerUtil.logInfo('MUTATION', ip, 'Invoked mutation createANote');
                const newEntry = await noteParser.newItem(data);
                return await new NotesDB(newEntry).save();
            } catch (err) {
                throw err;
            }
        },
    },
};

export default resolvers;
