import { rt, rq, rm } from './Register';
import { at, aq, am } from './Admin';
import { dt, dq, dm } from './Deceased';
import { mt, mq, mm } from './Memory';
import { lt, lq, lm } from './Location';
import { nt, nq, nm } from './Notes';
import { et, eq, em } from './Edits';

const types = [rt, dt, at, mt, lt, nt, et];
const queries = [rq, dq, aq, mq, lq, nq, eq];
const mutations = [rm, dm, am, mm, lm, nm, em];

export default `
#Custom scalar type Date
scalar Date

#Custom scalar type DateTIme 
scalar DateTime

#Custom scalar type Email 
scalar Email

${types.join('\n')}

type Query {
    hello : String ,
    ${queries.join('\n')}
}

type Mutation {
    ${mutations.join('\n')}
}

schema {
    query : Query,
    mutation : Mutation,
}
`;
