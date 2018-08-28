import mongoose from 'mongoose';

const personalNoteSchema = mongoose.Schema({
    nameOfPerson: { type: String, required: true },
    emailID: { type: String, required: true },
    note: { type: String, required: true },
    deceasedID: { type: String, required: true },
}, { timestamps: true });


const NotesDB = mongoose.model('notesList', personalNoteSchema);

export default NotesDB;
