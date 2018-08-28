import { InMemoryCache } from "apollo-cache-inmemory";
import { CachePersistor } from "apollo-cache-persist";
import jwt from "jwt-decode";
import { api } from "./init";
import { refreshAccessToken } from "./auth";

const setupCache = async () => {

  const cache = new InMemoryCache({
    dataIdFromObject: object => object.id
  });

  const persistor = new CachePersistor({
    cache,
    storage: window.localStorage
  });

  let errors = null;
  // Read the current schema version from AsyncStorage.
  let currentVersion = await localStorage.getItem("API_VERSION");

  if (currentVersion === api.VERSION.toString()) {
    await persistor.restore();
  } else {
    await persistor.purge();
    localStorage.setItem("API_VERSION", api.VERSION.toString());
  }

  let [accessToken, refreshToken] = await Promise.all([
    localStorage.getItem("ACCESS_TOKEN"),
    localStorage.getItem("REFRESH_TOKEN")
  ]);

  try {
    let accessTokenDecoded = jwt(accessToken);
    let refreshTokenDecoded = jwt(refreshToken);
    let currentTime = (Math.round((new Date()).getTime() / 1000)) + 3000;
    if (refreshTokenDecoded.exp > currentTime) {
      if (accessTokenDecoded.exp < currentTime) {
        await refreshAccessToken(refreshToken);
      }
    }else{
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("REFRESH_TOKEN");
    }
  } catch (err) {
    errors = err;
  }
  return {
    cache,
    errors
  };
};


export {setupCache};
