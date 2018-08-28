import chai from 'chai';
import '../../src/database/connections';
import { createAdminToken, createClientToken } from '../../src/controllers/jwtTokens';
import { InvalidID, NotAuthorized } from '../../src/lib/errors/CustomErrors';
import hasScope from '../../src/controllers/scopes';

const should = chai.should();


describe('Check if client & server tokens are created properly', () => {
    context('--> Function createClientToken', () => {
        it('should create a access token and refresh token', async () => {
            const guid = await createClientToken('3e816f6f18f2482893cfdaaf110b6ef6');
            guid.should.be.an('object');
            guid.should.have.property('refreshToken');
            guid.should.have.property('token');
        });
        it('should throw an InvalidID error if null guid is provided ', async () => {
            try {
                const guid = await createClientToken('');
                guid.should.be('array');
            } catch (err) {
                should.exist(err);
                err.should.be.an.instanceOf(InvalidID);
            }
        });
    });

    context('--> Function createAdminToken', function () {
        this.timeout(5000);
        it('should create a access token and refresh token', async () => {
            try {
                const guid = await createAdminToken('bajji944@gmail.com');
                guid.should.be.an('object');
                guid.should.have.property('refreshToken');
                guid.should.have.property('token');
            } catch (err) {
                should.not.exist(err);
            }
        });
        it('should throw an InvalidID error if null guid is provided ', async () => {
            try {
                const guid = await createClientToken('');
                guid.should.be('array');
            } catch (err) {
                should.exist(err);
                err.should.be.an.instanceOf(InvalidID);
            }
        });
    });
});

describe('Check JWT decoding and scope matching', () => {
    let guid;
    before(async () => {
        guid = await createClientToken('3e816f6f18f2482893cfdaaf110b6ef6');
    });
    it('should throw InvalidID error if token is not provided', async () => {
        try {
            const context = {
                headers: {
                    authorization: '',
                },
            };
            const verifyScope = await hasScope(context, '[client:read]');
        } catch (err) {
            should.exist(err);
            err.should.be.an.instanceOf(InvalidID);
        }
    });
    it('should match the scope in JWT with provided client scope', async () => {
        try {
            const context = {
                headers: {
                    authorization: guid.token,
                },
            };
            const verifyScope = await hasScope(context, ['client:read']);
            should.exist(verifyScope);
        } catch (err) {
            should.not.exist(err);
        }
    });
    it('should throw NotAuthorized if client JWT is used', async () => {
        try {
            const context = {
                headers: {
                    authorization: guid.token,
                },
            };
            const verifyScope = await hasScope(context, ['admin:read']);
        } catch (err) {
            should.exist(err);
            err.should.be.an.instanceOf(NotAuthorized);
        }
    });
});
