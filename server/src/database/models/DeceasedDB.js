import mongoose from 'mongoose';

const deceasedSchema = mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profilePic: { type: String, default: '' },
    dateOfBirth: { type: mongoose.Schema.Types.Date },
    dateOfDeath: { type: mongoose.Schema.Types.Date },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    zipcode: { type: String, default: '' },
    description: { type: String, default: '' },
    addedBy: [{ type: String, required: true }],
    editorNotes: [{ type: String, required: true }],
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: String, default: '' },
    editsList: [{ type: String, default: '' }],
}, { timestamps: true });

const DeceasedDB = mongoose.model('deceasedList', deceasedSchema);

export default DeceasedDB;
