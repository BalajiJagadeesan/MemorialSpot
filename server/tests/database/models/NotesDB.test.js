import chai from 'chai';
import NotesDB from '../../../src/database/models/NotesDB';

const should = chai.should();

describe('Test the notesSchema Model', () => {
    it('should require deceasedID', (done) => {
        const doc = new NotesDB({ deceasedID: null });
        doc.validate((err) => {
            should.exist(err.errors.deceasedID);
            done();
        });
    });
    it('should require nameOfPerson', (done) => {
        const doc = new NotesDB({ nameOfPerson: null });
        doc.validate((err) => {
            should.exist(err.errors.nameOfPerson);
            done();
        });
    });
    it('should require note', (done) => {
        const doc = new NotesDB({ note: null });
        doc.validate((err) => {
            should.exist(err.errors.note);
            done();
        });
    });
    it('should require emailID', (done) => {
        const doc = new NotesDB({ emailID: null });
        doc.validate((err) => {
            should.exist(err.errors.emailID);
            done();
        });
    });
});
