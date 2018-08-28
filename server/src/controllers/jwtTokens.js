import _ from 'lodash';
import * as jwt from 'jsonwebtoken';
import moment from 'moment';
import fs from 'fs';
import * as shortid from 'shortid';
import ClientDB from '../database/models/ClientDB';
import { info, errorName, GenricError, MongoError, InternalError, InvalidID } from '../lib/errors/CustomErrors';
import loggerUtil from '../lib/logger/winston-util';
import AdminDB from '../database/models/AdminDB';
import AuthDB from '../database/models/AuthDB';

const createClientToken = async (guid) => {
    const accessTokenID = shortid.generate();
    const refreshTokenID = shortid.generate();
    if (!guid) {
        const errorID = shortid.generate();
        loggerUtil.logErrorInternal('JWT_AUTH', `ErrorID: ${errorID}`, 'MSG ====>Invalid GUID');
        throw new InvalidID(info(errorID, 1512, 'Invalid GUID'));
    }
    try {
        const privateKey = fs.readFileSync('./private_key.pem');
        const options = {
            algorithm: 'RS256',
            expiresIn: '1d',
            issuer: 'dataserver@parkapi',
            jwtid: accessTokenID,
        };
        const credentials = {
            name: 'client-token',
            guid,
            scope: 'client:read client:create image:upload',
        };
        const accessToken = jwt.sign(credentials, privateKey, options);

        //  refresh token
        credentials.scope = 'client:refresh';
        options.expiresIn = '30d';
        options.jwtid = refreshTokenID;

        const refreshToken = jwt.sign(credentials, privateKey, options);
        const obj = {
            guid,
            tokens: [accessTokenID, refreshTokenID],
        };
        const guidEntry = await ClientDB.findOneAndUpdate({ guid }, obj, {
            upsert: true,
            new: true,
            runValidators: true,
        }).exec().catch((err) => {
            throw new GenricError(errorName('MongoError'));
        });
        if (_.isEmpty(guidEntry)) {
            throw new GenricError(errorName('InternalError'));
        }
        loggerUtil.logInfoInternal('ISSUED_TOKEN', `Issued tokens for ${guid}`);
        return { token: accessToken, refreshToken };
    } catch (err) {
        const errorID = shortid.generate();
        loggerUtil.logErrorInternal('JWT_AUTH', `ErrorID: ${errorID}`, `ERR MSG ====>${err}`);
        if (err.data.name === 'MongoError') {
            throw new MongoError(info(errorID, 1000, 'Error in writing to the database'));
        } else if (err.data.name === 'InternalError') {
            throw new InternalError(info(errorID, 2000, 'Some internal error,contact the administrator'));
        }
        throw err;
    }
};
const refreshClientAccessToken = async (guid, refreshTokenID) => {
    const accessTokenID = shortid.generate();
    if (!guid) {
        const errorID = shortid.generate();
        loggerUtil.logErrorInternal('JWT_AUTH', `ErrorID: ${errorID}`, 'MSG ====>Invalid GUID');
        throw new InvalidID(info(errorID, 1512, 'Invalid GUID'));
    }
    try {
        const privateKey = fs.readFileSync('./private_key.pem');
        const options = {
            algorithm: 'RS256',
            expiresIn: '1d',
            issuer: 'dataserver@parkapi',
            jwtid: accessTokenID,
        };
        const credentials = {
            name: 'client-token',
            guid,
            scope: 'client:read client:create image:upload',
        };
        const accessToken = jwt.sign(credentials, privateKey, options);

        const obj = {
            guid,
            tokens: [accessTokenID, refreshTokenID],
        };
        const guidEntry = await ClientDB.findOneAndUpdate({ guid }, obj, {
            upsert: true,
            new: true,
            runValidators: true,
        }).exec().catch((err) => {
            throw new GenricError(errorName('MongoError'));
        });
        if (_.isEmpty(guidEntry)) {
            throw new GenricError(errorName('InternalError'));
        }
        loggerUtil.logInfoInternal('ISSUED_TOKEN', `Issued tokens for ${guid}`);
        return accessToken;
    } catch (err) {
        const errorID = shortid.generate();
        loggerUtil.logErrorInternal('JWT_AUTH', `ErrorID: ${errorID}`, `ERR MSG ====>${err}`);
        if (err.data.name === 'MongoError') {
            throw new MongoError(info(errorID, 1000, 'Error in writing to the database'));
        } else if (err.data.name === 'InternalError') {
            throw new InternalError(info(errorID, 2000, 'Some internal error,contact the administrator'));
        }
        throw err;
    }
};
const createAdminToken = async (emailID, authenticatorToken) => {
    const accessTokenID = shortid.generate();
    const refreshTokenID = shortid.generate();
    if (_.isEmpty(emailID)) {
        const errorID = shortid.generate();
        loggerUtil.logErrorInternal('JWT_AUTH', `ErrorID: ${errorID}`, 'MSG ====>Invalid EmailID');
        throw new InvalidID(info(errorID, 1512, 'No emailID provided'));
    }
    try {
        const doesExist = await AdminDB.findOne({ emailID });
        if (!_.isEmpty(doesExist) && doesExist.isAccepted === true) {
            const privateKey = fs.readFileSync('./private_key.pem');
            const options = {
                algorithm: 'RS256',
                expiresIn: '1d',
                issuer: 'dataserver@parkapi',
                jwtid: accessTokenID,
            };
            const credentials = {
                name: 'admin-token',
                emailID,
                scope: 'admin:read admin:create admin:edit image:upload',
            };

            if (doesExist.acceptedOn) {
                console.log(doesExist.acceptedOn);
                if (moment.duration(moment().diff(moment(doesExist.acceptedOn))).asDays() > 100) {
                    credentials.scope = 'admin:read admin:create image:upload admin:edit admin:old';
                }
            }

            const accessToken = jwt.sign(credentials, privateKey, options);

            credentials.scope = 'admin:refresh';
            options.expiresIn = '30d';
            options.jwtid = refreshTokenID;

            const refreshToken = jwt.sign(credentials, privateKey, options);

            let insertThisObject;
            if (authenticatorToken) {
                insertThisObject = {
                    emailID,
                    tokens: [accessTokenID, refreshTokenID],
                    authenticatorToken,
                    adminID: doesExist._id,
                };
            } else {
                insertThisObject = {
                    tokens: [accessTokenID, refreshTokenID],
                };
            }

            const emailIDEntry = await AuthDB.findOneAndUpdate({ emailID }, insertThisObject, {
                upsert: true,
                new: true,
                runValidators: true,
            });
            if (_.isEmpty(emailIDEntry)) {
                throw new GenricError(errorName('InternalError'));
            }
            loggerUtil.logInfoInternal('ISSUED_TOKEN', `Issued tokens for ${emailID}`);
            return { token: accessToken, refreshToken };
        }
        const errorID = shortid.generate();
        return new InvalidID(info(errorID, 1514, 'Email not found/not authorized'));
    } catch (err) {
        const errorID = shortid.generate();
        loggerUtil.logErrorInternal('JWT_AUTH', `ErrorID: ${errorID}`, `ERR MSG ====>${err}`);
        if (err.name === 'MongoError') {
            throw new MongoError(info(errorID, 1000, 'Error in writing to the database'));
        } else if (err.data.name === 'InternalError') {
            throw new InternalError(info(errorID, 2000, 'Some internal error,contact the administrator'));
        }
        throw err;
    }
};

const refreshAdminToken = async (emailID, refreshTokenID) => {
    const accessTokenID = shortid.generate();
    if (_.isEmpty(emailID)) {
        const errorID = shortid.generate();
        loggerUtil.logErrorInternal('JWT_AUTH', `ErrorID: ${errorID}`, 'MSG ====>Invalid EmailID');
        throw new InvalidID(info(errorID, 1512, 'No emailID provided'));
    }
    try {
        const doesExist = await AdminDB.findOne({ emailID });
        if (!_.isEmpty(doesExist) && doesExist.isAccepted === true) {
            const privateKey = fs.readFileSync('./private_key.pem');
            const options = {
                algorithm: 'RS256',
                expiresIn: '1d',
                issuer: 'dataserver@parkapi',
                jwtid: accessTokenID,
            };
            const credentials = {
                name: 'admin-token',
                emailID,
                scope: 'admin:read admin:create admin:edit image:upload',
            };

            if (doesExist.acceptedOn) {
                if (moment.duration(moment().diff(moment(doesExist.acceptedOn))).asDays() > 100) {
                    credentials.scope = 'admin:read admin:create admin:upload admin:edit admin:old';
                }
            }

            const accessToken = jwt.sign(credentials, privateKey, options);

            const insertThisObject = {
                tokens: [accessTokenID, refreshTokenID],
            };

            const emailIDEntry = await AuthDB.findOneAndUpdate({ emailID }, insertThisObject, {
                upsert: true,
                new: true,
                runValidators: true,
            });
            if (_.isEmpty(emailIDEntry)) {
                throw new GenricError(errorName('InternalError'));
            }
            loggerUtil.logInfoInternal('ISSUED_TOKEN', `Issued tokens for ${emailID}`);
            return accessToken;
        }
        const errorID = shortid.generate();
        return new InvalidID(info(errorID, 1514, 'Email not found/not authorized'));
    } catch (err) {
        const errorID = shortid.generate();
        loggerUtil.logErrorInternal('JWT_AUTH', `ErrorID: ${errorID}`, `ERR MSG ====>${err}`);
        if (err.name === 'MongoError') {
            throw new MongoError(info(errorID, 1000, 'Error in writing to the database'));
        } else if (err.data.name === 'InternalError') {
            throw new InternalError(info(errorID, 2000, 'Some internal error,contact the administrator'));
        }
        throw err;
    }
};

export { createClientToken, createAdminToken, refreshClientAccessToken, refreshAdminToken };
