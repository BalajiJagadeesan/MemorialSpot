import chai from 'chai';
import DeceasedDB from '../../../src/database/models/DeceasedDB';

const should = chai.should();

describe('Test the deceasedSchema Model', () => {
    it('should require firstName', (done) => {
        const doc = new DeceasedDB({ firstName: null });
        doc.validate((err) => {
            should.exist(err.errors.firstName);
            done();
        });
    });
    it('should require lastName', (done) => {
        const doc = new DeceasedDB({ lastName: null });
        doc.validate((err) => {
            should.exist(err.errors.lastName);
            done();
        });
    });
    it('should require editorNotes', (done) => {
        const doc = new DeceasedDB({ editorNotes: [''] });
        doc.validate((err) => {
            should.exist(err.errors['editorNotes.0']);
            done();
        });
    });
    it('should require addedBy', (done) => {
        const doc = new DeceasedDB({ addedBy: [''] });
        doc.validate((err) => {
            should.exist(err.errors['addedBy.0']);
            done();
        });
    });
});
