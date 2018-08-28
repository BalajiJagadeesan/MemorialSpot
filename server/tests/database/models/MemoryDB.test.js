import chai from 'chai';
import MemoryDB from '../../../src/database/models/MemoryDB';

const should = chai.should();

describe('Test the memorySchema Model', () => {
    it('should require deceasedID', (done) => {
        const doc = new MemoryDB({ deceasedID: null });
        doc.validate((err) => {
            should.exist(err.errors.deceasedID);
            done();
        });
    });
    it('should require editorNotes', (done) => {
        const doc = new MemoryDB({ editorNotes: [''] });
        doc.validate((err) => {
            should.exist(err.errors['editorNotes.0']);
            done();
        });
    });
    it('should require addedBy', (done) => {
        const doc = new MemoryDB({ addedBy: [''] });
        doc.validate((err) => {
            should.exist(err.errors['addedBy.0']);
            done();
        });
    });
});
