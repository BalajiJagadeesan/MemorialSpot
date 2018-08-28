import chai from 'chai';
import AuthDB from '../../../src/database/models/AuthDB';

const should = chai.should();

describe('Test the authSchema Model', () => {
    it('should require emailID', (done) => {
        const doc = new AuthDB({ emailID: null });
        doc.validate((err) => {
            should.exist(err.errors.emailID);
            done();
        });
    });

    it('should require tokens', (done) => {
        const doc = new AuthDB({ tokens: [''] });
        doc.validate((err) => {
            should.exist(err.errors['tokens.0']);
            done();
        });
    });

    it('should require authenticatorToken', (done) => {
        const doc = new AuthDB({ authenticatorToken: null });
        doc.validate((err) => {
            should.exist(err.errors.authenticatorToken);
            done();
        });
    });

    it('should require adminID', (done) => {
        const doc = new AuthDB({ adminID: null });
        doc.validate((err) => {
            should.exist(err.errors.adminID);
            done();
        });
    });
});
