import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    emailID: {
        type: String, required: true, lowerCase: true, unique: true,
    },
    address: { type: String },
    socialMedia: [{ type: String, required: true }],
    isAccepted: { type: Boolean, default: false },
    acceptedOn: { type: Date },
    acceptedBy: { type: String },
}, { timestamps: true });

const AdminDB = mongoose.model('adminList', adminSchema);

export default AdminDB;
