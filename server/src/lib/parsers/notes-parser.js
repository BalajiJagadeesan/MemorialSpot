import _ from 'lodash';
import * as shortid from 'shortid';

import DeceasedDB from '../../database/models/DeceasedDB';
import Validator from '../ValidatorClass';
import { info, ValidationError } from '../errors/CustomErrors';
import loggerUtil from '../logger/winston-util';

const parser = {

    newItem: async (object) => {
        const parsedObject = {};
        const errors = [];
        const typeChecker = new Validator();

        if (object.nameOfPerson) {
            parsedObject.nameOfPerson = typeChecker.analyseFullName(object.nameOfPerson);
        } else {
            errors.push('nameOfPerson cannot be empty');
        }

        if (object.emailID) {
            parsedObject.emailID = typeChecker.analyseEmail(object.emailID);
        } else {
            errors.push('emailID cannot be empty');
        }

        if (object.note) {
            parsedObject.note = typeChecker.analyseDescription(object.note);
        }

        if (object.deceasedID) {
            parsedObject.deceasedID = typeChecker.analyseID(object.deceasedID);
            if (parsedObject.deceasedID) {
                const checkID = await DeceasedDB.findOne({ _id: parsedObject.deceasedID });
                if (_.isEmpty(checkID)) {
                    errors.push(`${parsedObject.deceasedID} is not a valid ID in the database`);
                }
            }
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
