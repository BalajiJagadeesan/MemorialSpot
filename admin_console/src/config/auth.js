import {createApolloFetch} from "apollo-fetch";
import { api } from "./init";
import { refreshAdminToken } from "../graphql/mutations";
import { cycleErrors } from "./helpers";
const apolloFetch = createApolloFetch({uri: api.URL});

const refreshAccessToken = async (refresh_token) => {
  apolloFetch.use(({request, options}, next) => {
    if (!options.headers) {
      options.headers = {};  // Create the headers object if needed.
    }
    options.headers['authorization'] = 'Bearer ' + refresh_token;
    next();
  });
  const {errors, data} = await apolloFetch({query: refreshAdminToken});
  if (data.refreshAdminToken) {
    localStorage.setItem("ACCESS_TOKEN", data.refreshAdminToken);
  }
  return {
    accessToken: data.refreshAdminToken,
    error: (errors) ? cycleErrors(errors) : null
  };
};

export {refreshAccessToken};
