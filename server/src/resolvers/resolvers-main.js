import _ from 'lodash';

import customTypes from './custom-datatypes';
import registerResolvers from './register-resolvers';
import deceasedResolvers from './deceased-resolvers';
import memoryResolvers from './memory-resolvers';
import locationResolvers from './location-resolvers';
import editsResolver from './edits-resolvers';
import notesResolvers from './notes-resolvers';
import adminResolvers from './admin-resolvers';

const resolvers = _.merge(
    customTypes,
    registerResolvers,
    adminResolvers,
    deceasedResolvers,
    memoryResolvers,
    locationResolvers,
    notesResolvers,
    editsResolver,
);

export default resolvers;
