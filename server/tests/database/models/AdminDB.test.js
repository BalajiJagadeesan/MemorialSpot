import chai from 'chai';
import AdminDB from '../../../src/database/models/AdminDB';

const should = chai.should();

describe('Test the adminSchema Model', () => {
    it('should require fullName', (done) => {
        const doc = new AdminDB({ fullName: null });
        doc.validate((err) => {
            should.exist(err.errors.fullName);
            done();
        });
    });
    it('should require emailID', (done) => {
        const doc = new AdminDB({ emailID: null });
        doc.validate((err) => {
            should.exist(err.errors.emailID);
            done();
        });
    });
    it('should require address', (done) => {
        const doc = new AdminDB({ address: null });
        doc.validate((err) => {
            should.exist(err.errors.address);
            done();
        });
    });
    it('should have at least one socialMedia profile', (done) => {
        const doc = new AdminDB({ socialMedia: [''] });
        doc.validate((err) => {
            should.exist(err.errors['socialMedia.0']);
            done();
        });
    });
});
