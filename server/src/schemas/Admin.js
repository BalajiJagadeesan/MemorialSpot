const types = `
    #@Description : Object that defines the information about the admin
    type Admin {
        
        #Object ID of the entry as represented in the database
        id : ID
        
        #Full Name of the administrator
        fullName : String!
        
        # Email ID of the administrator
        emailID : String!
        
        # Address ID of the administrator
        address : String
        
        # Some socialMedia profile to verify the administrator 
        socialMedia : [String!]!
        
        # Who have accepted this administrator 
        acceptedBy : Admin
        
        # When did they get accepted as administrator
        acceptedOn : DateTime  
    }
    
    #@Description : input structure to create an entry for administrator
    input adminJSON{
        #Full Name of the administrator (required)
        fullName : String!
        
        # Email ID of the administrator (required)
        emailID : String!
        
        # Address ID of the administrator (optional)
        address : String
        
        # Some socialMedia profile to verify the administrator 
        socialMedia : [String!]!
    }
    
`;

const queries = `
    # @Description : This query will get the administrator object for the provided adminID
    # @Input : adminID - Object ID as represented in database
    # @Token : accessToken
    # @Scope : [client:read]/[admin:read]
    # @Returns : Admin Object
    getAdminById (id: String) : Admin
    
    # @Description : This query will get the administrator object for the provided emailID
    # @Input : emailID - Email ID of admin as represented in database
    # @Token : accessToken
    # @Scope : [client:read]/[admin:read]
    # @Returns : Admin Object
    getAdminByEmailId (emailID : String) : Admin
    
    # @Description : This query will get the pending admin request
    # @Input : None
    # @Token : accessToken
    # @Scope : [client:read]/[admin:read]
    # @Returns : Array of Admin Object
    getPendingRequests : [Admin]
     
`;

const mutation = `

    # @Description : Creates a request entry in the database for the user to become the administrator
    # @Input : adminJSON - Input structure to create a request entry
    # @Token : accessToken
    # @Scope : [client:create]/[admin:create]
    # @Returns : Admin Object
    requestToBeAdmin (data: adminJSON) : Admin

    # @Description : Accept another user as the administrator
    # @Input : adminID (user that should be accepted as admin in AdminDB) - Object ID as represented in database 
    # @Token : accessToken
    # @Scope : [admin:edit]
    # @Returns : Admin Object
    acceptAdmin(id:String!) : Admin
    
    # @Description : This query will regenerate access token and refresh token invalidating the current tokens
    # @Input : None
    # @Token : refreshToken
    # @Scope : [admin:refresh] - only present in refreshToken
    # @Returns : Access Token as String
    refreshAdminToken : String
`;

export { types as at, queries as aq, mutation as am };
