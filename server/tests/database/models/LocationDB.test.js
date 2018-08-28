import chai from 'chai';
import LocationDB from '../../../src/database/models/LocationDB';

const should = chai.should();

describe('Test the locationSchema Model', () => {
    it('should require memoryID', (done) => {
        const doc = new LocationDB({ memoryID: null });
        doc.validate((err) => {
            should.exist(err.errors.memoryID);
            done();
        });
    });

    it('should require editorNotes', (done) => {
        const doc = new LocationDB({ editorNotes: [''] });
        doc.validate((err) => {
            should.exist(err.errors['editorNotes.0']);
            done();
        });
    });
    it('should require addedBy', (done) => {
        const doc = new LocationDB({ addedBy: [''] });
        doc.validate((err) => {
            should.exist(err.errors['addedBy.0']);
            done();
        });
    });
});
