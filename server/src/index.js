import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { formatError } from 'apollo-errors';
import compression from 'compression';
import cors from 'cors';
// import { Engine } from 'apollo-engine';

import cloudinaryEndpoint from './routes/cloudinary-endpoint';
import googleLogin from './routes/google-login';
import typeDefs from './schemas/schema-main';
import resolvers from './resolvers/resolvers-main';
import loggerUtil from './lib/logger/winston-util';
import './database/connections';

// const engine = new Engine({
//     engineConfig: {
//         apiKey: process.env.APOLLO_ENGINE,
//         logging: {
//             level: 'DEBUG', // Engine Proxy logging level. DEBUG, INFO, WARN or ERROR
//         },
//     },
//
//     // GraphQL port
//     graphqlPort: process.env.PORT || 3000,
//
//     // GraphQL endpoint suffix - '/graphql' by default
//     endpoint: '/parkserver',
//
//     // Debug configuration that logger traffic between Proxy and GraphQL server
//     // dumpTraffic: true,
// });
//
// engine.start();

const PORT = process.env.PORT || 3000;


const app = express();

// app.use(engine.expressMiddleware());

app.use(bodyParser.urlencoded({
    extended: true,
}));

app.use(bodyParser.json());

app.use(cors());

// Creating express app
app.use(cloudinaryEndpoint);
app.use(googleLogin);

app.use(compression());


//  Connecting Schema with resolvers
const parkSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

// Default API home page
app.use('/', express.static(`${__dirname}/doc/`));

// Endpoint of the server
app.use('/parkserver', bodyParser.json(), graphqlExpress(request => ({
    schema: parkSchema,
    context: request,
    formatError,
    // tracing: true,
    // cacheControl: true,
})));


app.listen(PORT, () => {
    loggerUtil.logInfoInternal('SERVER', `Server is listening on PORT :${PORT}`);
});
