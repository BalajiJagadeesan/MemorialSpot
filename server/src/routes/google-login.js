import _ from 'lodash';
import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { createAdminToken } from '../controllers/jwtTokens';
import loggerUtil from '../lib/logger/winston-util';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
router.post('/login', async (request, response) => {
    const { token } = request.body;
    if (!token) {
        response.send(JSON.stringify({ error: 'No token provided' }, null, 3));
    } else {
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
                // Specify the CLIENT_ID of the app that accesses the backend
            });
            const payload = ticket.getPayload();
            const userid = payload.sub;
            const tokens = await createAdminToken(payload.email, userid);
            if (_.isEmpty(tokens)) {
                loggerUtil.logErrorInternal('AUTH_ERROR', 'The username is not a approved admin', payload.email);
            }
            loggerUtil.logInfoInternal('ADMIN_AUTH', 'authentication successful');
            response.setHeader('status', 200);
            response.setHeader('Content-Type', 'application/json');
            response.send(JSON.stringify(tokens, null, 3));
        } catch (err) {
            response.setHeader('status', 401);
            response.setHeader('Content-Type', 'application/json');
            response.send(JSON.stringify({ error: err.message }, null, 3));
        }
    }
});

export default router;
