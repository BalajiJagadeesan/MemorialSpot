import chai from 'chai';
import EditsDB from '../../../src/database/models/EditsDB';

const should = chai.should();

describe('Test the editsSchema Model', () => {
    it('should require correspondingID', (done) => {
        const doc = new EditsDB({ correspondingID: null });
        doc.validate((err) => {
            should.exist(err.errors.correspondingID);
            done();
        });
    });

    it('should require entryField', (done) => {
        const doc = new EditsDB({ entryField: null });
        doc.validate((err) => {
            should.exist(err.errors.entryField);
            done();
        });
    });
    it('should require entryFieldValue', (done) => {
        const doc = new EditsDB({ entryFieldValue: null });
        doc.validate((err) => {
            should.exist(err.errors.entryFieldValue);
            done();
        });
    });

    it('should require description', (done) => {
        const doc = new EditsDB({ description: null });
        doc.validate((err) => {
            should.exist(err.errors.description);
            done();
        });
    });

    it('should require editorName', (done) => {
        const doc = new EditsDB({ editorName: null });
        doc.validate((err) => {
            should.exist(err.errors.editorName);
            done();
        });
    });

    it('should require emailID', (done) => {
        const doc = new EditsDB({ emailID: null });
        doc.validate((err) => {
            should.exist(err.errors.emailID);
            done();
        });
    });
});
