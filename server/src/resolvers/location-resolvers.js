import requestIp from 'request-ip';
import _ from 'lodash';
import * as shortid from 'shortid';

import loggerUtil from '../lib/logger/winston-util';
import hasScope from '../controllers/scopes';
import { info, MongoError, NotAuthorized, ValidationError } from '../lib/errors/CustomErrors';
import Validator from '../lib/ValidatorClass';
import MemoryDB from '../database/models/MemoryDB';
import LocationDB from '../database/models/LocationDB';
import AdminDB from '../database/models/AdminDB';
import locationParser from '../lib/parsers/location-parser';
import DeceasedDB from "../database/models/DeceasedDB";

const resolvers = {
    Query: {
        getLocationById: async (root, args, context) => {
            const ip = requestIp.getClientIp(context);
            const typeChecker = new Validator();
            try {
                const decodedJWT = await hasScope(context, ['client:read', 'admin:read']);
                loggerUtil.logInfo('QUERY', ip, 'Invoked query getLocationById');
                const cleanedID = typeChecker.analyseID(args.id);
                if (!_.isEmpty(typeChecker.errors)) {
                    const errorID = shortid.generate();
                    loggerUtil.logErrorWithDetails('Validation Error', ip, `ErrorID: ${errorID}`, `MSG ====> ${typeChecker.errors}`);
                    return new ValidationError(info(errorID, 1550, typeChecker.errors));
                }
                loggerUtil.logInfo('QUERY', ip, 'Served endpoint getLocationById');
                return await LocationDB.findOne({ _id: cleanedID });
            } catch (err) {
                throw err;
            }
        },
        getUnVerfiedLocation: async (root, { limit, offset }, context) => {
            try {
                const decodedJWT = await hasScope(context, ['admin:read']);
                return await LocationDB.find({ isVerified: false }).limit(limit).skip(offset);
            } catch (err) {
                throw err;
            }
        },
        getNearByLocation: async (root, { lat, long }, context) => {
            const ip = requestIp.getClientIp(context);
            const typeChecker = new Validator();
            try {
                const decodedJWT = await hasScope(context, ['client:read', 'admin:read']);
                loggerUtil.logInfo('QUERY', ip, 'Invoked query getNearByLocation');
                const cleanedLatLong = typeChecker.analyseLatLong(lat, long);
                if (!_.isEmpty(typeChecker.errors)) {
                    const errorID = shortid.generate();
                    loggerUtil.logErrorWithDetails('Validation Error', ip, `ErrorID: ${errorID}`, `MSG ====> ${typeChecker.errors}`);
                    return new ValidationError(info(errorID, 1550, typeChecker.errors));
                }
                loggerUtil.logInfo('QUERY', ip, 'Served endpoint getNearByLocation');
                return await LocationDB.aggregate([{
                    $geoNear: {
                        near: { type: 'Point', coordinates: [cleanedLatLong.longitude, cleanedLatLong.latitude] },
                        distanceField: 'dist.calculated',
                        maxDistance: (2 * 1609.34), // 2 miles in meter
                        // meter to miles returned distance in miles
                        distanceMultiplier: 0.000621371,
                        spherical: true,
                        limit: 10, // return only 10 records
                    },
                }]);
            } catch (err) {
                throw err;
            }
        },
    },
    Location: {
        id: location => location._id,
        memory: async location => MemoryDB.findOne({ _id: location.memoryID }),
        latitude: location => location.geometry.coordinates[1],
        longitude: location => location.geometry.coordinates[0],
        verifiedBy: async (location) => {
            if (location.isVerified === true && location.verifiedBy) {
                return AdminDB.findOne({ _id: location.verifiedBy });
            }
            return null;
        },
    },

    Mutation: {
        createLocation: async (root, { data }, context) => {
            const ip = requestIp.getClientIp(context);
            try {
                const decodedJWT = await hasScope(context, ['client:create', 'admin:create']);
                loggerUtil.logInfo('MUTATION', ip, 'Invoked mutation createLocation');
                const newEntry = await locationParser.newItem(data);
                return await new LocationDB(newEntry).save();
            } catch (err) {
                throw err;
            }
        },
        editLocation: async (root, { data }, context) => {
            const ip = requestIp.getClientIp(context);
            try {
                const decodedJWT = await hasScope(context, ['admin:edit']);
                loggerUtil.logInfo('MUTATION', ip, 'Invoked mutation editLocation');
                const editEntry = await locationParser.editItem(data);
                return await LocationDB.findOneAndUpdate({ _id: editEntry.id }, editEntry, {
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
        verifyLocation: async (root, { id }, context) => {
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
                    return await LocationDB.findOneAndUpdate({ _id: id }, obj, {
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
