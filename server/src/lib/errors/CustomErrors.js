import { createError } from 'apollo-errors';

const info = (errorID, errorCode, errorMessage) => ({
    data: {
        errorID,
        errorCode,
        errorMessage,
    },
});
const errorName = name => ({
    data: {
        name,
    },
});
const GenricError = createError('GenericError', {
    message: 'Used to create new error',
});
const InternalError = createError('InternalError', {
    message: 'Some Internal Error (see data for more details)',
});
const NotAuthorized = createError('NotAuthorized', {
    message: 'The user is not authorized (see data for more details)',
});

const MongoError = createError('MongoDB', {
    message: 'Error in execution of MongoDB query',
});

const InvalidID = createError('InvalidID', {
    message: 'ID provided is not valid (see data for more details)',
});

const InvalidQueryParameter = createError('InvalidQueryParameter', {
    message: 'There is a mismatch in query parameter',
});
const ValidationError = createError('ValidationError', {
    message: 'Some error in validation (see details for more info)',
});
const DuplicateError = createError('Duplication Error', {
    message: 'Duplication of value in the entry',
});

export {
    info,
    errorName,
    GenricError,
    NotAuthorized,
    InternalError,
    MongoError,
    InvalidID,
    ValidationError,
    DuplicateError,
    InvalidQueryParameter,
};
