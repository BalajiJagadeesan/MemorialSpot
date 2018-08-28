import requestIp from 'request-ip';
import loggerUtil from '../lib/logger/winston-util';
import hasScope from '../controllers/scopes';
import { createClientToken, refreshClientAccessToken } from '../controllers/jwtTokens';

const resolvers = {
    Query: {
        refreshClientToken: async (root, args, request) => {
            const ip = requestIp.getClientIp(request);
            try {
                const decodedJWT = await hasScope(request, ['client:refresh']);
                loggerUtil.logInfo('CLIENT_REFRESH_TOKEN', ip, `Issuing token for ${decodedJWT.guid}`);
                return createClientToken(decodedJWT.guid);
            } catch (err) {
                throw err;
            }
        },
    },
    Mutation: {
        registerClient: async (root, { data }, request) => {
            const ip = requestIp.getClientIp(request);
            loggerUtil.logInfo('CLIENT_REGISTER', ip, `Issuing token for ${data.guid}`);
            return createClientToken(data.guid);
        },
        refreshClientAccessToken: async (root, { data }, request) => {
            const ip = requestIp.getClientIp(request);
            try {
                const decodedJWT = await hasScope(request, ['client:refresh']);
                loggerUtil.logInfo('CLIENT_REFRESH_TOKEN', ip, `Issuing token for ${decodedJWT.guid}`);
                return refreshClientAccessToken(decodedJWT.guid, decodedJWT.jti);
            } catch (err) {
                throw err;
            }
        },
    },
};

export default resolvers;
