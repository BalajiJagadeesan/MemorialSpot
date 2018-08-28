import {
    GraphQLDate,
    GraphQLDateTime,
} from 'graphql-iso-date';
import { GraphQLEmail } from 'graphql-custom-types';

const resolvers = {
    Date: GraphQLDate,
    DateTime: GraphQLDateTime,
    Email: GraphQLEmail,
    Query: {
        hello: () => 'Hello World',
    },
};

export default resolvers;
