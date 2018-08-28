import _ from 'lodash';
import * as shortid from 'shortid';

import DeceasedDB from '../../database/models/DeceasedDB';
import MemoryDB from '../../database/models/MemoryDB';
import Validator from '../ValidatorClass';
import { DuplicateError, info, InvalidID, ValidationError } from '../errors/CustomErrors';
import loggerUtil from '../logger/winston-util';

const parser = {
    newItem: async (object) => {
        const parsedObject = {};
        const errors = [];
        const typeChecker = new Validator();

        if (!_.isEmpty(object.memoryType)) {
            parsedObject.memoryType = typeChecker.analyseMemoryType(object.memoryType);
        } else {
            errors.push('memoryType cannot be empty');
        }

        if (!_.isEmpty(object.memoryImageURL)) {
            parsedObject.memoryImageURL = object.memoryImageURL.map(x => typeChecker.analyseURL(x));
        } else {
            parsedObject.memoryImageURL = [];
        }

        if (object.deceasedID) {
            parsedObject.deceasedID = typeChecker.analyseID(object.deceasedID);
            if (parsedObject.deceasedID) {
                const person = await DeceasedDB.findOne({ _id: parsedObject.deceasedID });
                if (!_.isEmpty(person)) {
                    if (object.erectedOn) {
                        parsedObject.erectedOn = typeChecker.validDateUTC(object.erectedOn, 'erectedOn');
                        if (parsedObject.erectedOn && person.dateOfDeath) {
                            if (!typeChecker
                                .checkDateOneOlder(
                                    person.dateOfDeath,
                                    parsedObject.erectedOn,
                                )) {
                                errors.push('dateOfDeath date is after erectedOn date');
                            }
                        }
                    }
                } else {
                    errors.push('deceasedID is not valid in the database');
                }
            }
        } else {
            errors.push('deceasedID cannot be empty');
        }

        if (!_.isEmpty(object.erectedBy)) {
            parsedObject.erectedBy = object.erectedBy
                .map(x => typeChecker.analyseDescription(x));
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
                originalObject = await MemoryDB.findOne({ _id: parsedObject.id });
            }
        } else {
            errors.push('ID cannot be empty');
        }

        if (_.isEmpty(originalObject)) {
            const errorID = shortid.generate();
            typeChecker.errors.map(x => errors.push(x));
            throw new InvalidID(info(errorID, 1513, 'Object ID is invalid'));
        }

        if (!_.isEmpty(object.memoryType)) {
            parsedObject.memoryType = typeChecker.analyseMemoryType(object.memoryType);
        }


        if (!_.isEmpty(object.memoryImageURL)) {
            parsedObject.memoryImageURL = originalObject.memoryImageURL;
            const temp = object.memoryImageURL.map(x => typeChecker.analyseURL(x));
            if (!_.isEmpty(temp)) {
                temp.map(x => parsedObject.memoryImageURL.push(x));
            }
        }

        if (object.deceasedID) {
            parsedObject.deceasedID = typeChecker.analyseID(object.deceasedID);
            if (parsedObject.deceasedID) {
                const person = await DeceasedDB.findOne({ _id: parsedObject.deceasedID });
                if (!_.isEmpty(person)) {
                    if (object.erectedOn) {
                        parsedObject.erectedOn = typeChecker.validDateUTC(object.erectedOn, 'erectedOn');
                        if (parsedObject.erectedOn && person.dateOfDeath) {
                            if (!typeChecker
                                .checkDateOneOlder(
                                    person.dateOfDeath,
                                    parsedObject.erectedOn,
                                )) {
                                errors.push('dateOfDeath date is after erectedOn date');
                            }
                        }
                    }
                } else {
                    errors.push('deceasedID is not valid in the database');
                }
            }
        } else if (object.erectedOn) {
            parsedObject.erectedOn = typeChecker.validDateUTC(object.erectedOn, 'erectedOn');
            const person = await DeceasedDB.findOne({ _id: originalObject.deceasedID });
            if (!_.isEmpty(person) && person.dateOfDeath && parsedObject.erectedOn) {
                if (!typeChecker
                    .checkDateOneOlder(
                        person.dateOfDeath,
                        parsedObject.erectedOn,
                    )) {
                    errors.push('dateOfDeath date is after erectedOn date');
                }
            }
        }

        if (!_.isEmpty(object.erectedBy)) {
            parsedObject.erectedBy = originalObject.erectedBy;
            const temp = object.erectedBy
                .map(x => typeChecker.analyseFullName(x));
            if (!_.isEmpty(temp)) {
                temp.map(x => parsedObject.erectedBy.push(x));
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
