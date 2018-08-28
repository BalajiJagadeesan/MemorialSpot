import validator from 'validator';
import moment from 'moment';
import _ from 'lodash';

import sanitizer from './sanitizer';

class Validator {
    constructor() {
        this.errors = [];
    }

    analyseSearchTerm(name) {
        const expression = new RegExp("^[A-Za-z'.]+$");
        const temp = sanitizer.trimRemoveSpacesFirstUpper(name);
        if (!expression.test(temp)) {
            this.errors.push(`${temp} should not contain any special character`);
            return null;
        }
        return temp;
    }

    analyseID(id) {
        const expression = new RegExp('^[0-9a-fA-F]{24}$');
        const temp = sanitizer.trimRemoveSpacesLower(id);
        if (!expression.test(temp)) {
            this.errors.push(`${temp} must be of length 24 and must not contain special characters for object casting`);
            return null;
        }
        return temp;
    }

    analyseFullName(name) {
        let temp = sanitizer.trimAndRemoveExtraSpacesLower(name);
        temp = temp.split(' ').map(x => sanitizer.trimAndFirstLetterUpper(x)).join(' ');
        const expression = new RegExp("^[A-Za-z'. ]{2,30}$");
        if (!expression.test(temp)) {
            this.errors.push(`${temp} should be of length 2-30 characters`);
        }
        return temp;
    }

    analyseName(name) {
        const expression = new RegExp("^[A-Za-z'. ]{2,15}$");
        let temp = sanitizer.trimAndRemoveExtraSpacesLower(name);
        temp = temp.split(' ').map(x => sanitizer.trimAndFirstLetterUpper(x)).join(' ');
        if (!expression.test(temp)) {
            this.errors.push(`${temp} should be of length 2-15 characters`);
            return null;
        }
        return temp;
    }

    analyseURL(url) {
        const temp = sanitizer.trimRemoveSpaces(url);
        if (validator.isURL(temp)) {
            if (url.search('cloudinary.com/parkapi/') === -1) {
                this.errors.push(`${temp} is not from our cloud service`);
            }
        } else {
            this.errors.push(`${temp} is not a valid URL`);
        }
        return temp;
    }

    validDateUTC(date, what) {
        if (validator.isISO8601(date.toISOString())) {
            const newDate = moment.utc(date).format('YYYY-MM-DD');
            if (moment(newDate, 'YYYY-MM-DD', true).isValid()) {
                return newDate;
            }
            this.errors.push(`${what} is not valid`);
            return null;
        }
        this.errors.push(`${what} is not valid`);
        return null;
    }

    checkDateOneOlder(dateOne, dateTwo) {
        return moment.duration(moment(dateOne).diff(dateTwo)).asDays() < 0;
    }

    analyseAddress(address) {
        const temp = sanitizer.trimAndRemoveExtraSpacesLower(address);
        const expression = new RegExp('^[0-9A-Za-z,/ ]+$');
        if (!expression.test(temp)) {
            this.errors.push('Address should not contain special characters other than , and /');
            return null;
        }
        return temp;
    }

    analyseCity(city) {
        let temp = sanitizer.trimAndRemoveExtraSpacesLower(city);
        temp = temp.split(' ').map(x => sanitizer.trimAndFirstLetterUpper(x)).join(' ');
        const expression = new RegExp('^[A-Za-z ]+$');
        if (!expression.test(temp)) {
            this.errors.push(`${temp}-city cannot contain any special characters`);
            return null;
        }
        return temp;
    }

    analyseState(state) {
        const temp = sanitizer.trimRemoveSpacesUpper(state);
        const expression = new RegExp('^[A-Z]{2}$');
        if (!expression.test(temp)) {
            this.errors.push(`${temp}-state should be of 2 characters`);
            return null;
        }
        return temp;
    }

    analyseZipcode(zipcode) {
        const temp = sanitizer.trimRemoveSpaces(zipcode);
        if (!validator.isPostalCode(temp, 'any')) {
            this.errors.push(`${temp}-zipcode provided is not valid`);
            return null;
        }
        return temp;
    }

    analyseCountry(country) {
        let temp = sanitizer.trimAndRemoveExtraSpacesLower(country);
        temp = temp.split(' ').map(x => sanitizer.trimRemoveExtraSpaces(x)).join(' ');
        const expression = new RegExp('^[A-Za-z ]{1,50}$');
        if (!expression.test(temp)) {
            this.errors.push(`${temp}-country cannot contain any special characters`);
            return null;
        }
        return temp;
    }

    analyseDescription(description) {
        return sanitizer.trimRemoveExtraSpaces(description);
    }

    analyseEmail(email) {
        const temp = sanitizer.trimRemoveSpacesLower(email);
        if (!validator.isEmail(temp)) {
            this.errors.push(`${temp} is not a valid email`);
        }
        return temp;
    }

    analyseEditorFormat(editor) {
        const values = editor.split('-');
        if (values.length === 2) {
            const name = this.analyseFullName(values[0]);
            const email = this.analyseEmail(values[1]);
            if (_.isEmpty(this.errors)) {
                return `${name}-${email}`;
            }
        } else {
            this.errors.push('addedBy is not in the format of [personName-emailID]');
        }
        return editor;
    }

    analyseEditorNotes(notes) {
        return sanitizer.trimRemoveExtraSpaces(notes);
    }

    analyseMemoryType(type) {
        const temp = sanitizer.trimRemoveSpacesUpper(type);
        if (['TREE', 'BENCH', 'GARDEN', 'OTHER'].indexOf(type) === -1) {
            this.errors.push(`${temp} does not belong to type 'memory_type'`);
        }
        return temp;
    }

    analyseLatLong(lat, long) {
        if (validator.isLatLong(`${lat},${long}`)) {
            return { latitude: parseFloat(lat), longitude: parseFloat(long) };
        }
        this.errors.push('The coordinates are not valid');
        return null;
    }

    analyseEditType(type) {
        const temp = sanitizer.trimRemoveSpacesUpper(type);
        const index = ['DECEASED_PERSON', 'DECEASED_PERSON_IMAGE', 'MEMORY', 'MEMORY_IMAGE', 'LOCATION'].indexOf(temp);
        if (index === -1) {
            this.errors.push(`${temp} does not belong to type in 'nameOfEntry'`);
        }
        return temp;
    }

    analyseSocialMedia(url) {
        const temp = sanitizer.trimRemoveSpaces(url);
        if (!validator.isURL(temp)) {
            this.errors.push(`${temp} is not a valid URL`);
        }
        return temp;
    }
}

export default Validator;
