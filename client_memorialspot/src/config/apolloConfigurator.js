/**
 * Apollo Client and Cache setup for GraphQL Queries and Mutations
 */
import Reactotron from "reactotron-react-native";
import {AsyncStorage} from 'react-native';

import {InMemoryCache} from 'apollo-cache-inmemory';
import {CachePersistor} from 'apollo-cache-persist';
import {createHttpLink} from 'apollo-link-http';
import {setContext} from 'apollo-link-context';
import {ApolloClient} from "apollo-client";
import jwt from 'jwt-decode';
import uuid from 'uuid';
import {api} from './init';
import {getAuth, refreshAccessToken} from "./auth";


const setupcache = async () => {

    const cache = new InMemoryCache({
        dataIdFromObject: object => object.id
    });

    const persistor = new CachePersistor({
        cache,
        storage: AsyncStorage,
    });

    let errors = null;
    // Read the current schema version from AsyncStorage.
    let currentVersion = await AsyncStorage.getItem("API_VERSION");

    if (currentVersion === api.VERSION) {
        Reactotron.log("I'm restoring data");
        await persistor.restore();
    } else {
        await persistor.purge();
        await AsyncStorage.setItem("API_VERSION", api.VERSION);
    }

    let [guid, accessToken, refreshToken] = await Promise.all([
        AsyncStorage.getItem("GUID"),
        AsyncStorage.getItem("ACCESS_TOKEN"),
        AsyncStorage.getItem("REFRESH_TOKEN")
    ]);

    //Generate new guid if null (first boot)
    if (guid === null) {
        guid = await uuid.v4();
    }

    if (accessToken === null && refreshToken === null) {
        await getAuth(guid);
    } else {
        try {
            let accessTokenDecoded = jwt(accessToken);
            let refreshTokenDecoded = jwt(refreshToken);
            let currentTime = (Math.round((new Date()).getTime() / 1000)) + 3000;
            if (refreshTokenDecoded.exp > currentTime) {
                if (accessTokenDecoded.exp < currentTime) {
                    Reactotron.log("Refreshing using refreshToken");
                    await refreshAccessToken(refreshToken);
                }
            } else {
                Reactotron.log("RefreshTokenInvalid");
                await getAuth(guid);
            }
        } catch (err) {
            Reactotron.log(err);
            errors = err;
        }
    }
    return {
        cache,
        errors
    };
};


const setupClient = async (cache) => {
    const httpLink = createHttpLink({
        uri: api.URL,
    });

    const authLink = setContext(async (_, {headers}) => {
        // get the authentication token from local storage if it exists
        // return the headers to the context so httpLink can read them
        let token = await AsyncStorage.getItem("ACCESS_TOKEN");
        Reactotron.log("Header"+token);
        return {
            headers: {
                ...headers,
                authorization: token ? `Bearer ${token}` : null,
            }
        }
    });

    const defaultOptions = {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
            errorPolicy: 'all',
        },
        // query: {
        //     fetchPolicy: 'cache-and-network',
        //     errorPolicy: 'all',
        // },
        // mutate: {
        //     errorPolicy: 'all',
        // },
    };

    return new ApolloClient({
        link: authLink.concat(httpLink),
        cache,
        defaultOptions
    });
};


export {setupClient,setupcache};
