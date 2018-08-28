/**
 * Functions to authenticate the client device and refresh access_token
 */
import {createApolloFetch} from "apollo-fetch";
import {api} from "./init";
import {AsyncStorage} from 'react-native';
// import Reactotron from "reactotron-react-native";
import {registerUser, refreshClientToken} from "../graphql/mutations";
import {cycleErrors} from "./helpers";

const apolloFetch = createApolloFetch({uri: api.URL});

const getAuth = async (guid) => {
    const variables = {
        guid,
    };
    const {errors, data} = await apolloFetch({query: registerUser, variables});
    if (data) {
        // Reactotron.log("Issued "+data.registerClient.token);
        await Promise.all([AsyncStorage.setItem("AUTH_STATUS", "GOOD"),
            AsyncStorage.setItem("ACCESS_TOKEN", data.registerClient.token),
            AsyncStorage.setItem("REFRESH_TOKEN", data.registerClient.refreshToken)]);
    }
    return {
        accessToken: data.registerClient.token,
        refreshToken: data.registerClient.refreshToken,
        errors: (errors) ? cycleErrors(errors) : null,
    }

};

const refreshAccessToken = async (refresh_token) => {
    apolloFetch.use(({request, options}, next) => {
        if (!options.headers) {
            options.headers = {};  // Create the headers object if needed.
        }
        options.headers['authorization'] = 'Bearer ' + refresh_token;
        next();
    });
    const {errors, data} = await apolloFetch({query: refreshClientToken});
    if (data.refreshClientAccessToken) {
        // Reactotron.log("Refreshed "+data.refreshClientAccessToken);
        await AsyncStorage.setItem("ACCESS_TOKEN", data.refreshClientAccessToken);
    }
    return {
        accessToken: data.refreshClientAccessToken,
        error: (errors) ? cycleErrors(errors) : null
    };
};


export {getAuth, refreshAccessToken}
