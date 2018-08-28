import _ from 'lodash';
import * as shortid from 'shortid';

import MemoryDB from '../../database/models/MemoryDB';
import Validator from '../ValidatorClass';
import { DuplicateError, info, InvalidID, ValidationError } from '../errors/CustomErrors';
import loggerUtil from '../logger/winston-util';
import LocationDB from '../../database/models/LocationDB';

const parser = {
    newItem: async (object) => {
        const parsedObject = {};
        const errors = [];
        const typeChecker = new Validator();

        if (object.latitude && object.longitude) {
            const temp = typeChecker.analyseLatLong(object.latitude, object.longitude);
            if (!_.isEmpty(temp)) {
                parsedObject.geometry = {
                    type: 'Point',
                    coordinates: [temp.longitude, temp.latitude],
                };
            }
        } else {
            errors.push('latitude and longitude are not provided');
        }

        if (object.memoryID) {
            parsedObject.memoryID = typeChecker.analyseID(object.memoryID);
            if (!_.isEmpty(parsedObject.memoryID)) {
                const duplicateMemory = await LocationDB
                    .findOne({ memoryID: parsedObject.memoryID });
                if (!_.isEmpty(duplicateMemory)) {
                    errors.push('The provided memoryID has already have a location entry.' +
                        'memoryID can have only one location associated with it.');
                } else {
                    const validMemory = await MemoryDB.findOne({ _id: object.memoryID });
                    if (_.isEmpty(validMemory)) {
                        errors.push('memoryID does not have a valid entry in the database');
                    }
                }
            }
        } else {
            errors.push('memoryID cannot be empty');
        }

        if (!_.isEmpty(object.addedBy)) {
            parsedObject.addedBy = [typeChecker.analyseEditorFormat(object.addedBy)];
        } else {
            errors.push('addedBy cannot be empty');
        }

        if (!_.isEmpty(object.editorNotes)) {
            parsedObject.editorNotes = [typeChecker.analyseEditorNotes(object.editorNotes)];
        } else {
            errors.push('editorNotes cannot be empty');
        }

        if (!_.isEmpty(typeChecker.errors) || !_.isEmpty(errors)) {
            const errorID = shortid.generate();
            loggerUtil.logErrorInternal('Validation Error', `ErrorID: ${errorID}`, `MSG ====> ${errors}`);
            typeChecker.errors.map(x => errors.push(x));
            // errors.map(x=>typeChecker.errors(x))
            throw new ValidationError(info(errorID, 1550, errors));
        } else {
            parsedObject.isVerified = false;
            parsedObject.verifiedBy = '';
            return parsedObject;
        }
    },
    editItem: async (object) => {
        const parsedObject = {};
        let originalObject;
        const errors = [];
        const typeChecker = new Validator();
        if (object.id) {
            parsedObject.id = typeChecker.analyseID(object.id);
            if (_.isEmpty(typeChecker.errors)) {
                originalObject = await LocationDB.findOne({ _id: parsedObject.id });
            }
        } else {
            errors.push('ID cannot be empty');
        }

        if (_.isEmpty(originalObject)) {
            const errorID = shortid.generate();
            typeChecker.errors.map(x => errors.push(x));
            throw new InvalidID(info(errorID, 1513, 'Object ID is invalid'));
        }

        if (object.latitude && object.longitude) {
            const temp = typeChecker.analyseLatLong(object.latitude, object.longitude);
            if (!_.isEmpty(temp)) {
                parsedObject.geometry = {
                    type: 'Point',
                    coordinates: [temp.longitude, temp.latitude],
                };
            }
        } else if (object.latitude) {
            const temp = typeChecker
                .analyseLatLong(object.latitude, originalObject.geometry.coordinates[0]);
            if (!_.isEmpty(temp)) {
                parsedObject.geometry = {
                    type: 'Point',
                    coordinates: [temp.longitude, temp.latitude],
                };
            }
        } else if (object.longitude) {
            const temp = typeChecker
                .analyseLatLong(originalObject.geometry.coordinates[1], object.longitude);
            if (!_.isEmpty(temp)) {
                parsedObject.geometry = {
                    type: 'Point',
                    coordinates: [temp.longitude, temp.latitude],
                };
            }
        }

        if (object.memoryID) {
            parsedObject.memoryID = typeChecker.analyseID(object.memoryID);
            if (!_.isEmpty(parsedObject.memoryID)) {
                const duplicateMemory = await LocationDB
                    .findOne({ memoryID: parsedObject.memoryID });
                if (!_.isEmpty(duplicateMemory)) {
                    errors.push('The provided memoryID has already have a location entry' +
                        'memoryID can have only one location associated with it.');
                } else {
                    const validMemory = await MemoryDB.findOne({ _id: object.memoryID });
                    if (_.isEmpty(validMemory)) {
                        errors.push('memoryID does not have a valid entry in the database');
                    }
                }
            }
        }

        if (object.addedBy) {
            const temp = typeChecker.analyseEditorFormat(object.addedBy);
            parsedObject.addedBy = [temp];
            originalObject.addedBy.map(x => parsedObject.addedBy.push(x));
        } else {
            errors.push('addedBy cannot be empty');
        }

        if (object.editorNotes) {
            const temp = typeChecker.analyseEditorNotes(object.editorNotes);
            parsedObject.editorNotes = [temp];
            originalObject.editorNotes.map(x => parsedObject.editorNotes.push(x));
        } else {
            errors.push('editorNotes cannot be empty');
        }

        if (object.editID) {
            const temp = typeChecker.analyseID(object.editID);
            if (_.includes(originalObject.editsList, temp)) {
                const errorID = shortid.generate();
                throw new DuplicateError(info(errorID, 1551, 'The changes corresponding to this entry ID are already applied'));
            }
            parsedObject.editsList = [temp];
            originalObject.editsList.map(x => parsedObject.editsList.push(x));
        }

        if (!_.isEmpty(typeChecker.errors) || !_.isEmpty(errors)) {
            const errorID = shortid.generate();
            loggerUtil.logErrorInternal('Validation Error', `ErrorID: ${errorID}`, `MSG ====> ${errors}`);
            typeChecker.errors.map(x => errors.push(x));
            throw new ValidationError(info(errorID, 1550, errors));
        } else {
            parsedObject.isVerified = false;
            parsedObject.verifiedBy = '';
            return parsedObject;
        }
    },
};

export default parser;
