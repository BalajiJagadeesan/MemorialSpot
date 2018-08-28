import mongoose from 'mongoose';

const memorySchema = mongoose.Schema({
    memoryType: { type: String, enum: ['TREE', 'BENCH', 'GARDEN', 'OTHER'], default: 'OTHER' },
    memoryImageURL: [{ type: String, default: '' }],
    deceasedID: { type: String, required: true },
    erectedOn: { type: mongoose.Schema.Types.Date },
    erectedBy: [{ type: String, default: '' }],
    addedBy: [{ type: String, required: true }],
    editorNotes: [{ type: String, required: true }],
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: String, default: '' },
    editsList: [{ type: String, default: '' }],
}, { timestamps: true });

const MemoryDB = mongoose.model('memoryList', memorySchema);

export default MemoryDB;
