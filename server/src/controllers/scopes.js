import * as jwt from 'jsonwebtoken';
import fs from 'fs';
import * as shortid from 'shortid';
import ClientDB from '../database/models/ClientDB';
import { info, errorName, NotAuthorized, GenricError } from '../lib/errors/CustomErrors';
import loggerUtil from '../lib/logger/winston-util';
import AuthDB from '../database/models/AuthDB';

const hasScope = async (context, expectedScopes) => {
    const token = context.headers.authorization;
    if (!token) {
        const errorID = shortid.generate();
        loggerUtil.logErrorInternal('JWT_AUTH', `ErrorID: ${errorID}`, 'MSG ====>No JWT Token provided');
        throw new NotAuthorized(info(errorID, 1502, 'No token can be found in header'));
    }
    try {
        const publicKey = fs.readFileSync('./public_key.pem');
        const options = {
            algorithms: ['RS256'],
            issuer: 'dataserver@parkapi',
        };
        const decoded = await jwt.verify(token.replace('Bearer ', ''), publicKey, options);
        if (decoded.guid) {
            const guidTokenId = await ClientDB.findOne({ guid: decoded.guid });
            if (guidTokenId.tokens.indexOf(decoded.jti) !== -1) {
                const scopes = decoded.scope.split(' ');
                if (!expectedScopes.some(scope => scopes.indexOf(scope) !== -1)) {
                    throw new GenricError(errorName('NoScope'));
                }
                return decoded;
            }
        } else if (decoded.emailID) {
            const adminToken = await AuthDB.findOne({ emailID: decoded.emailID });
            if (adminToken.tokens.indexOf(decoded.jti) !== -1) {
                const scopes = decoded.scope.split(' ');
                if (!expectedScopes.some(scope => scopes.indexOf(scope) !== -1)) {
                    throw new GenricError(errorName('NoScope'));
                }
                return decoded;
            }
        }
        throw new GenricError(errorName('InvalidToken'));
    } catch (err) {
        const errorID = shortid.generate();
        loggerUtil.logErrorInternal('JWT_AUTH', `ErrorID: ${errorID}`, `MSG ===> ${err}`);
        if (err.name === 'TokenExpiredError') {
            throw new NotAuthorized(info(errorID, 1503, 'Token has expired'));
        } else if (err.name === 'JsonWebTokenError') {
            throw new NotAuthorized(info(errorID, 1504, `Token Verification Error==>${err.message}`));
        } else if (err.data.name === 'NoScope') {
            throw new NotAuthorized(info(errorID, 1511, "Token doesn't have necessary scope to access this endpoint"));
        } else if (err.data.name === 'InvalidToken') {
            throw new NotAuthorized(info(errorID, 1505, 'Newer token is issued for this id'));
        }
        throw new NotAuthorized(info(errorID, 1500, 'Not authorized due to server issues'));
    }
};

export default hasScope;
