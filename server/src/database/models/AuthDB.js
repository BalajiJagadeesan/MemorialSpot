import mongoose from 'mongoose';

const authSchema = mongoose.Schema({
    emailID: {
        type: String, required: true, lowerCase: true, unique: true,
    },
    tokens: [{ type: String, required: true }],
    authenticatorToken: { type: String, required: true },
    adminID: { type: String, required: true },
}, { timestamps: true });

const AuthDB = mongoose.model('authList', authSchema);

export default AuthDB;

