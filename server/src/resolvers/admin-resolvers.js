import _ from 'lodash';
import requestIp from 'request-ip';
import * as shortid from 'shortid';

import loggerUtil from '../lib/logger/winston-util';
import { info, MongoError, NotAuthorized, ValidationError } from '../lib/errors/CustomErrors';
import Validator from '../lib/ValidatorClass';
import hasScope from '../controllers/scopes';
import AdminDB from '../database/models/AdminDB';
import adminParser from '../lib/parsers/admin-parser';
import { createAdminToken, refreshAdminToken } from '../controllers/jwtTokens';

const resolvers = {

    Query: {
        getAdminById: async (root, { id }, context) => {
            const ip = requestIp.getClientIp(context);
            const typeChecker = new Validator();
            try {
                const decodedJWT = await hasScope(context, ['client:read', 'admin:read']);
                loggerUtil.logInfo('QUERY', ip, 'Invoked query getAdminById');
                const cleanedID = typeChecker.analyseID(id);
                if (!_.isEmpty(typeChecker.errors)) {
                    const errorID = shortid.generate();
                    loggerUtil.logErrorWithDetails('Validation Error', ip, `ErrorID: ${errorID}`, `MSG ====> ${typeChecker.errors}`);
                    return new ValidationError(info(errorID, 1550, typeChecker.errors));
                }
                loggerUtil.logInfo('QUERY', ip, 'Served endpoint getAdminById');
                return await AdminDB.findOne({ _id: cleanedID });
            } catch (err) {
                throw err;
            }
        },
        getAdminByEmailId: async (root, { emailID }, context) => {
            const ip = requestIp.getClientIp(context);
            const typeChecker = new Validator();
            try {
                const decodedJWT = await hasScope(context, ['client:read', 'admin:read']);
                loggerUtil.logInfo('QUERY', ip, 'Invoked query getAdminByEmailId');
                const cleanedEmailID = typeChecker.analyseEmail(emailID);
                if (!_.isEmpty(typeChecker.errors)) {
                    const errorID = shortid.generate();
                    loggerUtil.logErrorWithDetails('Validation Error', ip, `ErrorID: ${errorID}`, `MSG ====> ${typeChecker.errors}`);
                    return new ValidationError(info(errorID, 1550, typeChecker.errors));
                }
                loggerUtil.logInfo('QUERY', ip, 'Served endpoint getAdminByEmailId');
                return await AdminDB.findOne({ emailID: cleanedEmailID });
            } catch (err) {
                throw err;
            }
        },
        getPendingRequests: async (root, {}, context) => {
            const ip = requestIp.getClientIp(context);
            try {
                const decodedJWT = await hasScope(context, ['admin:read']);
                loggerUtil.logInfo('QUERY', ip, 'Served endpoint getPendingRequest');
                return await AdminDB.find({ isAccepted: false });
            } catch (err) {
                throw err;
            }
        },
    },
    Admin: {
        acceptedBy: admin => AdminDB.findOne({ _id: admin.acceptedBy }),
    },
    Mutation: {
        refreshAdminToken: async (root, args, request) => {
            const ip = requestIp.getClientIp(request);
            try {
                const decodedJWT = await hasScope(request, ['admin:refresh']);
                loggerUtil.logInfo('ADMIN_REFRESH_TOKEN', ip, `Issuing token for ${decodedJWT.emailID}`);
                return refreshAdminToken(decodedJWT.emailID, decodedJWT.jti);
            } catch (err) {
                throw err;
            }
        },
        requestToBeAdmin: async (root, { data }, context) => {
            const ip = requestIp.getClientIp(context);
            try {
                const decodedJWT = await hasScope(context, ['client:create', 'admin:create']);
                loggerUtil.logInfo('MUTATION', ip, 'Invoked mutation requestToBeAdmin');
                const newEntry = await adminParser.newItem(data);
                return await new AdminDB(newEntry).save();
            } catch (err) {
                throw err;
            }
        },
        acceptAdmin: async (root, { id }, context) => {
            const ip = requestIp.getClientIp(context);
            try {
                const decodedJWT = await hasScope(context, ['admin:edit']);
                loggerUtil.logInfo('MUTATION', ip, 'Invoked mutation acceptAdmin');
                const currentAdmin = await AdminDB.findOne({ emailID: decodedJWT.emailID });
                if (!_.isEmpty(currentAdmin)) {
                    if (currentAdmin._id === id) {
                        const errorID = shortid.generate();
                        loggerUtil.logErrorWithDetails('NotAuthorized', ip, `ErrorID: ${errorID}`, 'MSG ====> You are not authorized to authorize this ID');
                        return new NotAuthorized(info(errorID, 1500, 'You are not authorized to authorize this ID'));
                    }
                    const obj = {
                        isAccepted: true,
                        acceptedOn: Date.now(),
                        acceptedBy: currentAdmin._id,
                    };
                    return await AdminDB.findOneAndUpdate({ _id: id }, obj, {
                        new: true,
                        runValidators: true,
                    }).exec().then(content => content).catch((err) => {
                        const errorID = shortid.generate();
                        loggerUtil.logErrorWithDetails('MONGO_ERROR', ip, `ErrorID: ${errorID}`, `MSG ====> ${err}`);
                        return new MongoError(info(errorID, 1000, 'Error in executing query'));
                    });
                }
                return null;
            } catch (err) {
                throw err;
            }
        },
    },
};

export default resolvers;
