const types = `
#@Description : input structure to pass to the API to generate the JWTTokens
input ClientCredentials{
    #Some unique identifier to uniquely identify the device (should be of 24 characters) 
    guid : String!
}

#@Description : Object that returns accessToken & refreshToken to client or admin
type JWTTokens {

    #@Description : Access Token with scopes to access endpoints
    token: String,
    
    #@Description : Refresh token to regenerate accessToken and refreshToken
    #Note : If lost the user need to log in again with the API
    refreshToken : String,
}
`;

const queries = `
    # @Description : This query will regenerate access token and refresh token invalidating the current tokens
    # @Input : None
    # @Token : refreshToken
    # @Scope : [client:refresh] - only present in refreshToken
    refreshClientToken : JWTTokens 
`;
const mutations = `
    # @Description : This query will generate access token and refresh token for the user
    # @Input : { data: ClientCredentials }
    # @Token : None
    # @Scope : None
    registerClient ( data : ClientCredentials ) : JWTTokens
    
    #@Description: This query will generate only the accessToken with the provided refreshToken
    #@Input : None
    #@Token : Refresh Token
    #@Scope : [client:refresh] - only present in refreshToken
    #@Returns : Access Token
    refreshClientAccessToken : String, 
`;

export { types as rt, queries as rq, mutations as rm };
