import mongoose from 'mongoose';

const geoSchema = mongoose.Schema({
    type: {
        type: String,
        default: 'Point',
    },
    coordinates: {
        type: [Number],
        index: '2dsphere',
    },
});

const locationSchema = mongoose.Schema({
    geometry: geoSchema,
    memoryID: { type: String, required: true },
    addedBy: [{ type: String, required: true }],
    editorNotes: [{ type: String, required: true }],
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: String, default: '' },
    editsList: [{ type: String, default: '' }],
}, { timestamps: true });


const LocationDB = mongoose.model('locationList', locationSchema);

export default LocationDB;
