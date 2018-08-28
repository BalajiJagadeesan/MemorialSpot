import mongoose from 'mongoose';

const editsSchema = mongoose.Schema({
    nameOfEntry: {
        type: String,
        enum: ['DECEASED_PERSON', 'MEMORY', 'LOCATION', 'DECEASED_PERSON_IMAGE', 'MEMORY_IMAGE'],
        required: true,
    },
    correspondingID: { type: String, required: true },
    entryField: { type: String, required: true },
    entryFieldValue: { type: String, required: true },
    description: { type: String, required: true },
    editorName: { type: String, required: true },
    emailID: { type: String, required: true },
    archive: { type: Boolean, default: false },
}, { timestamps: true });

const EditsDB = mongoose.model('editList', editsSchema);

export default EditsDB;
