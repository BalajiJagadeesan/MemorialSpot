import chai from 'chai';
import ClientDB from '../../../src/database/models/ClientDB';

const should = chai.should();

describe('Test the clientSchema Model', () => {
    it('should require guid', (done) => {
        const doc = new ClientDB({ guid: null });
        doc.validate((err) => {
            should.exist(err.errors.guid);
            done();
        });
    });


    it('should require tokens', (done) => {
        const doc = new ClientDB({ tokens: [''] });
        doc.validate((err) => {
            should.exist(err.errors['tokens.0']);
            done();
        });
    });
});
