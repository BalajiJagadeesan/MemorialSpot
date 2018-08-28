import _ from 'lodash';
import * as shortid from 'shortid';

import DeceasedDB from '../../database/models/DeceasedDB';
import MemoryDB from '../../database/models/MemoryDB';
import Validator from '../ValidatorClass';
import { DuplicateError, info, InvalidID, ValidationError } from '../errors/CustomErrors';
import loggerUtil from '../logger/winston-util';

const parser = {
    newItem: (object) => {
        const parsedObject = {};
        const errors = [];
        const typeChecker = new Validator();
        if (object.firstName) {
            parsedObject.firstName = typeChecker.analyseName(object.firstName);
        } else {
            errors.push('firstName cannot be empty');
        }

        if (object.lastName) {
            parsedObject.lastName = typeChecker.analyseName(object.lastName);
        } else {
            errors.push('lastName cannot be empty');
        }

        if (object.profilePic) {
            parsedObject.profilePic = typeChecker.analyseURL(object.profilePic);
        }

        if (object.dateOfBirth) {
            parsedObject.dateOfBirth = typeChecker.validDateUTC(object.dateOfBirth, 'dateOfBirth');
            if (parsedObject.dateOfBirth) {
                if (object.dateOfDeath) {
                    parsedObject.dateOfDeath = typeChecker.validDateUTC(object.dateOfDeath, 'dateOfDeath');
                    if (parsedObject.dateOfDeath) {
                        if (!typeChecker.checkDateOneOlder(
                            parsedObject.dateOfBirth,
                            parsedObject.dateOfDeath,
                        )) {
                            errors.push('dateOfBirth is greater than dateOfDeath');
                        }
                    }
                }
            }
        } else if (object.dateOfDeath) {
            parsedObject.dateOfDeath = typeChecker.validDateUTC(object.dateOfDeath, 'dateOfDeath');
        }

        if (object.address) {
            parsedObject.address = typeChecker.analyseAddress(object.address);
        }

        if (object.city) {
            parsedObject.city = typeChecker.analyseCity(object.city);
        }

        if (object.state) {
            parsedObject.state = typeChecker.analyseState(object.state);
        }

        if (object.zipcode) {
            parsedObject.zipcode = typeChecker.analyseZipcode(object.zipcode);
        }

        if (object.country) {
            parsedObject.country = typeChecker.analyseCountry(object.country);
        }

        if ((object.description)) {
            parsedObject.description = typeChecker.analyseDescription(object.description);
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
            throw new ValidationError(info(errorID, 1550, errors));
        } else {
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
                originalObject = await DeceasedDB.findOne({ _id: parsedObject.id });
            }
        } else {
            errors.push('ID cannot be empty');
        }

        if (_.isEmpty(originalObject)) {
            const errorID = shortid.generate();
            typeChecker.errors.map(x => errors.push(x));
            throw new InvalidID(info(errorID, 1513, 'Object ID is invalid'));
        }

        if (object.firstName) {
            parsedObject.firstName = typeChecker.analyseName(object.firstName);
        }

        if (object.lastName) {
            parsedObject.lastName = typeChecker.analyseName(object.lastName);
        }

        if (object.profilePic) {
            parsedObject.profilePic = typeChecker.analyseURL(object.profilePic);
        }

        const memoryObject = await MemoryDB.find({ deceasedID: parsedObject.id });
        if (object.dateOfBirth && object.dateOfDeath) {
            parsedObject.dateOfBirth = typeChecker
                .validDateUTC(object.dateOfBirth, 'dateOfBirth');
            parsedObject.dateOfDeath = typeChecker
                .validDateUTC(object.dateOfDeath, 'dateOfDeath');
            if (parsedObject.dateOfBirth && parsedObject.dateOfDeath) {
                if (typeChecker
                    .checkDateOneOlder(
                        parsedObject.dateOfBirth,
                        parsedObject.dateOfDeath,
                    )) {
                    let flag = 0;
                    memoryObject.forEach((item) => {
                        const checkBirth = typeChecker.checkDateOneOlder(
                            parsedObject.dateOfBirth,
                            item.erectedOn,
                        );
                        const checkDeath = typeChecker.checkDateOneOlder(
                            parsedObject.dateOfDeath,
                            item.erectedOn,
                        );
                        if (!checkBirth || !checkDeath) {
                            flag = 1;
                        }
                    });
                    if (flag === 1) {
                        errors.push('The new dates doesn\'t comply with existing memory entries');
                    }
                } else {
                    errors.push('dateOfBirth is greater than dateOfDeath');
                }
            }
        } else if (object.dateOfBirth) {
            parsedObject.dateOfBirth = typeChecker
                .validDateUTC(object.dateOfBirth, 'dateOfBirth');
            if (parsedObject.dateOfBirth) {
                if (typeChecker
                    .checkDateOneOlder(
                        parsedObject.dateOfBirth,
                        originalObject.dateOfDeath,
                    )) {
                    let flag = 0;
                    memoryObject.forEach((item) => {
                        const checkBirth = typeChecker.checkDateOneOlder(
                            parsedObject.dateOfBirth,
                            item.erectedOn,
                        );
                        if (!checkBirth) {
                            flag = 1;
                        }
                    });
                    if (flag === 1) {
                        errors.push('The new dateOfBirth doesn\'t comply with existing memory entries');
                    }
                } else {
                    errors.push('New dateOfBirth is greater than old dateOfDeath');
                }
            }
        } else if (object.dateOfDeath) {
            parsedObject.dateOfDeath = typeChecker
                .validDateUTC(object.dateOfDeath, 'dateOfDeath');
            if (parsedObject.dateOfDeath) {
                if (typeChecker
                    .checkDateOneOlder(
                        originalObject.dateOfBirth,
                        parsedObject.dateOfDeath,
                    )) {
                    let flag = 0;
                    memoryObject.forEach((item) => {
                        const checkDeath = typeChecker.checkDateOneOlder(
                            parsedObject.dateOfDeath,
                            item.erectedOn,
                        );
                        if (!checkDeath) {
                            flag = 1;
                        }
                    });
                    if (flag === 1) {
                        errors.push('The new dateOfDeath doesn\'t comply with existing memory entries');
                    }
                } else {
                    errors.push('New dateOfDeath is greater than old dateOfBirth');
                }
            }
        }

        if (object.address) {
            parsedObject.address = typeChecker.analyseAddress(object.address);
        }

        if (object.city) {
            parsedObject.city = typeChecker.analyseCity(object.city);
        }

        if (object.state) {
            parsedObject.state = typeChecker.analyseState(object.state);
        }

        if (object.zipcode) {
            parsedObject.zipcode = typeChecker.analyseZipcode(object.zipcode);
        }

        if (object.country) {
            parsedObject.country = typeChecker.analyseCountry(object.country);
        }

        if ((object.description)) {
            parsedObject.description = typeChecker.analyseDescription(object.description);
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
            // errors.map(x=>typeChecker.errors(x))
            throw new ValidationError(info(errorID, 1550, errors));
        } else {
            parsedObject.isVerified = false;
            parsedObject.verifiedBy = '';
            return parsedObject;
        }
    },
};

export default parser;
