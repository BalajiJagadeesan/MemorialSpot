const types = `
# @Description : Object that defines the information about the location of the memorial
type Location{
    # Object ID of the entry as represented in the database
    id : ID,
    
    # Latitude coordinate of the memory
    latitude : String,
    
    # Longitude coordinate of the memory
    longitude : String,
    
    # Memory Object that the location represents
    memory : Memory
    
    # Users that created/modified this entry 
    addedBy : [String]!
    
    # Notes given by user while modifying/creating this entry
    editorNotes : [String]!
    
    # Last time this entry got updated
    updatedAt : DateTime,
    
    # Time this entry got created
    createdAt : DateTime
    
    # Is this information verified by an administrator after it got updated
    isVerified : Boolean
    
    # The administrator that verified this entry
    verifiedBy : Admin
}

# @Description : Input structure to create the location entry
#
# @Example : {
#       latitude    : "14.06547",
#       longitude   : "19.0876",
#       memoryID    : "54759eb3c090d83494e2d805", @Required
#       addedBy     : "Alex Truman-alex.truman@gmail.com" @Required
#       editorNotes : "created a location entry" @Required
#   }
input locationJSON{
    
    # Latitude coordinate of the memory
    latitude : String,
    
    # Longitude coordinate of the memory
    longitude : String,
   
    #Corresponding memory ID
    memoryID : String!
    
    # User that created/modified this entry 
    # @Format : John Oliver - john.oliver@gmail.com
    addedBy : String!
    
    # Note given by user while modifying/creating this entry
    editorNotes : String!
}

# @Description : Input structure to edit the memory location
#
# @Example: {
#       id          : "54759eb3c090d83494e2d809"
#       latitude    : "14.0567",
#       longitude   : "19.0876",
#       memoryID    : "54759eb3c090d83494e2d805",
#       addedBy     : "Alex Truman-alex.truman@gmail.com" @Required
#       editorNotes : "Modified the latitude entry" @Required
#       editID      : "54759eb3c090d83494e2d813"
#   }
input editLocationJSON {
    
    #Object ID of the entry that needs to be edited
    id : String,
    
    # Latitude coordinate of the memory
    latitude  : String
    
    # Longitude coordinate of the memory
    longitude : String
    
    #Corresponding memory ID
    memoryID : String
    
    # User that created/modified this entry 
    # @Format : John Oliver - john.oliver@gmail.com
    addedBy : String!
    
    # Note given by user while modifying/creating this entry
    editorNotes : String!
    
    # Edit ID that is being referred
    editID: String
}
   
`;

const queries = `

    # @Description : Get the information regarding the location by Id
    # @Input : 
    #   id - Object ID of the location entry       
    # @Token : accessToken
    # @Scope : [client:read]/[admin:read]
    # @Returns : Location Object
    getLocationById (id:String!) : Location
    
    # @Description : Get the unverified list of memory
    # @Input : 
    #   limit       -   No. of records that should be returned
    #   offset      -   No. of records that should be skipped           
    # @Token : accessToken
    # @Scope : [admin:read]
    # @Returns : List of deceased person object
    getUnVerfiedLocation (limit : Int ,offset: Int) : [Location]
    
    
    # @Description : Get the information of the deceased person by name
    # @Input : 
    #   lat     - Latitude position of the user
    #   long    - Longitude position of the user           
    # @Token : accessToken
    # @Scope : [client:read]/[admin:read]
    # @Returns : List of memorial location near to the user's position
    getNearByLocation (lat : String,long : String) : [Location]
    
`;

const mutations = `

    # @Description : Create a new location entry for the memorial
    # @Input : locationJSON - input structure for location object entry
    # @Token : accessToken
    # @Scope : [client:create]/[admin:create]
    # @Returns : created location object
    createLocation (data : locationJSON) : Location
    
    # @Description : Edit already existing location entry
    # @Input : editLocationJSON - Input structure to edit a location entry
    # @Token : accessToken
    # @Scope : [admin:edit]
    # @Returns : edited location entry
    editLocation (data:editLocationJSON) : Location
    
    # @Description : Verify the location entry
    # @Input : locationID (that is needed to be verified)- Object ID as represented in database  
    # @Token : accessToken
    # @Scope : [admin:edit]
    # @Returns : verified location object
    verifyLocation(id : String!) : Location
`;

export { types as lt, queries as lq, mutations as lm };
