import mongoose from 'mongoose';

const clientSchema = mongoose.Schema({
    guid: { type: String, required: true },
    quota: {
        type: Number,
        required: true,
        default: 0,
        max: 5,
    },
    tokens: [{ type: String, required: true }],
}, { timestamps: true });

const ClientDB = mongoose.model('clientList', clientSchema);

export default ClientDB;
