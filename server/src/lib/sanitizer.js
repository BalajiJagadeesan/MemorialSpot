import _ from 'lodash';


const sanitizer = {
    removeSpaces: data => data.replace(/\s+/g, ''),
    removeExtraSpaces: data => data.replace(/\s\s+/g, ' '),
    trimRemoveExtraSpaces: data => (_.flow([_.trim, sanitizer.removeExtraSpaces])(data)),
    trimRemoveSpaces: data => (_.flow([_.trim, sanitizer.removeSpaces])(data)),
    trimRemoveSpacesLower: data => (_.flow([_.trim, sanitizer.removeSpaces, _.toLower])(data)),
    trimRemoveSpacesUpper: data => (_.flow([_.trim, sanitizer.removeSpaces, _.toUpper])(data)),
    trimRemoveSpacesFirstUpper: data =>
        (_.flow([_.trim, sanitizer.removeSpaces, _.toLower, _.upperFirst])(data)),
    trimAndLower: data => (_.flow([_.trim, _.toLower])(data)),
    trimAndRemoveExtraSpacesLower: data =>
        (_.flow([_.trim, sanitizer.removeExtraSpaces, _.toLower])(data)),
    trimAndUpper: data => (_.flow([_.trim, _.toUpper])(data)),
    trimAndFirstLetterUpper: data => (_.flow([_.trim, _.toLower, _.upperFirst])(data)),
};


export default sanitizer;
