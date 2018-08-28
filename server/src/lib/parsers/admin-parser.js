import _ from 'lodash';
import * as shortid from 'shortid';

import Validator from '../ValidatorClass';
import loggerUtil from '../logger/winston-util';
import { info, ValidationError } from '../errors/CustomErrors';
import AdminDB from '../../database/models/AdminDB';

const parser = {

    newItem: async (object) => {
        const errors = [];
        const typeChecker = new Validator();
        const parsedObject = {};
        if (object.fullName) {
            parsedObject.fullName = typeChecker.analyseFullName(object.fullName);
        } else {
            errors.push('fullName cannot be empty');
        }

        if (object.emailID) {
            parsedObject.emailID = typeChecker.analyseEmail(object.emailID);
        } else {
            errors.push('emailID cannot be empty');
        }

        if (object.address) {
            parsedObject.address = typeChecker.analyseAddress(object.address);
        }

        if (!_.isEmpty(object.socialMedia)) {
            parsedObject.socialMedia = object.socialMedia
                .map(x => typeChecker.analyseSocialMedia(x));
        } else {
            parsedObject.socialMedia = [];
        }
        const existingEmail = await AdminDB.findOne({ emailID: parsedObject.emailID });

        if (!_.isEmpty(existingEmail)) {
            errors.push(`${parsedObject.emailID} already exists in database`);
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
};

export default parser;
