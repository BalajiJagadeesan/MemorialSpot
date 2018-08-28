import _ from 'lodash';
import * as shortid from 'shortid';

import DeceasedDB from '../../database/models/DeceasedDB';
import MemoryDB from '../../database/models/MemoryDB';
import LocationDB from '../../database/models/LocationDB';
import Validator from '../ValidatorClass';
import { info, ValidationError } from '../errors/CustomErrors';
import loggerUtil from '../logger/winston-util';


const parser = {
    newItem: async (object) => {
        const parsedObject = {};
        const errors = [];
        const typeChecker = new Validator();

        if (object.nameOfEntry) {
            parsedObject.nameOfEntry = typeChecker.analyseEditType(object.nameOfEntry);
            if (parsedObject.nameOfEntry) {
                const index = ['DECEASED_PERSON',
                    'DECEASED_PERSON_IMAGE',
                    'MEMORY',
                    'MEMORY_IMAGE',
                    'LOCATION'].indexOf(parsedObject.nameOfEntry);
                let checkID;
                switch (index) {
                case 0:
                case 1:
                    checkID = await DeceasedDB.findOne({ _id: object.correspondingID });
                    if (_.isEmpty(checkID)) {
                        errors.push(`${parsedObject.nameOfEntry} is not a valid ID in deceased document`);
                    }
                    break;
                case 2:
                case 3:
                    checkID = await MemoryDB.findOne({ _id: object.correspondingID });
                    if (_.isEmpty(checkID)) {
                        errors.push(`${parsedObject.nameOfEntry} is not a valid ID in memory document`);
                    }
                    break;
                case 4:
                    checkID = await LocationDB.findOne({ _id: object.correspondingID });
                    if (_.isEmpty(checkID)) {
                        errors.push(`${parsedObject.nameOfEntry} is not a valid ID in location document`);
                    }
                    break;
                default:
                    errors.push('nameOfEntry not valid');
                    break;
                }
            }
        }

        parsedObject.correspondingID = object.correspondingID;
        parsedObject.entryField = object.entryField;
        parsedObject.entryFieldValue = object.entryFieldValue;

        if (object.description) {
            parsedObject.description = typeChecker.analyseDescription(object.description);
        }

        if (object.editorName) {
            parsedObject.editorName = typeChecker.analyseFullName(object.editorName);
        } else {
            errors.push('editorName cannot be empty');
        }

        if (object.emailID) {
            parsedObject.emailID = typeChecker.analyseEmail(object.emailID);
        } else {
            errors.push('emailID cannot be empty');
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
