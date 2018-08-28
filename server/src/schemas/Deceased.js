const types = `

#@Description :  Object that defines the information about the deceased person
type Deceased{
    # Object ID of the entry as represented in the database
    id : ID,
    
    # First name of the deceased person
    firstName : String,
    
    # Last name of the person
    lastName : String,
    
    # Image URL of the person photo (should be uploaded to provided cloudinary database)
    profilePic : String,
    
    # Date of Birth of the deceased person
    dateOfBirth : Date,
    
    # Date of Death of the deceased person
    dateOfDeath : Date,
    
    # Home Town details of deceased person- Street  
    address : String,
    
    # Home Town details of deceased person- City 
    city : String,
    
    # Home Town details of deceased person- State
    state : String,
    
    # Home Town details of deceased person - Country
    country : String
    
    # Home Town details of deceased person - Zipcode
    zipcode : String
    
    # Some personal description about the deceased person
    description: String,
    
    # Some personal testimonials written by relatives
    personalNote : [Note],
    
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
    
    # Physical artifacts dedicated in memory of the deceased person
    memories : [Memory]
}

# @Description :  Input structure to create an entry for the deceased person
#
# @Example : {
#       firstName   :   "Richard", @Required
#       lastName    :   "Hendricks", @Required
#       profilePic  :   "https://res.cloudinary.com/parkapi/image/upload/v1517773440/cex3dpmbm10jkjsxxfl1.png",
#       dateOfBirth :   "1950-05-02",
#       dateOfDeath :   "2017-03-15",
#       address     :   "23, Monti Cross",
#       city        :   "Rochester",
#       state       :   "NY",
#       country     :   "USA",
#       Zipcode     :   "14623",
#       description :   "Loving father,caring husband and a valiant solider",
#       addedBy     :   "peter clint-peter.clint@gmail.com", @Required
#       editorNotes :   "Created an entry for Richard Hendricks", @Required
#   }
input personJSON{
    # First name of the deceased person
    firstName : String!,
    
    # Last name of the deceased person
    lastName : String!,
    
    # Image URL of the person photo (should be uploaded to provided cloudinary database)
    profilePic : String,
    
    # Date of Birth of the deceased person
    # @Format : YYYY-MM-DD
    dateOfBirth : Date,
    
    # Date of Death of the deceased person 
    # @Format : YYYY-MM-DD
    dateOfDeath : Date,
    
    # Home Town details of deceased person - Address 
    address : String,
    
    # Home Town details of deceased person - City 
    city : String,
    
    # Home Town details of deceased person - State
    state : String,
    
    # Home Town details of deceased person - Country
    country : String
    
    # Home Town details of deceased person - Zipcode
    zipcode : String
    
    # Some personal description about the deceased person
    description: String,
    
    # Users that created/modified this entry 
    # @Format : fullName - emailID
    addedBy : String!
    
    # Notes given by user while modifying/creating this entry
    editorNotes : String!
    
}
# @Description : Input structure to edit an entry for the deceased person
#
# @Format: {
#       id          :   "54759eb3c090d83494e2d804", @Required
#       firstName   :   "Richard",
#       lastName    :   "Hendricks", 
#       profilePic  :   "https://res.cloudinary.com/parkapi/image/upload/v1517773440/cex3dpmbm10jkjsxxfl1.png",
#       dateOfBirth :   "1950-05-02",
#       dateOfDeath :   "2017-03-15",
#       address     :   "23, Monti Cross",
#       city        :   "Rochester",
#       state       :   "NY",
#       country     :   "USA",
#       Zipcode     :   "14623",
#       description :   "Loving father,caring husband and a valiant solider",
#       addedBy     :   "peter clint-peter.clint@gmail.com", @Required
#       editorNotes :   "Created an entry for Richard Hendricks", @Required
#       editID      :   "54759eb3c090d83494e2d814"
#   }

input editPersonJSON{
    #ID of the entry to be edited
    id : String!
    
    # First name of the deceased person
    firstName : String,
    
    # Last name of the deceased person
    lastName : String,
    
    # Image URL of the person photo (should be uploaded to provided cloudinary database)
    profilePic : String,
    
    # Date of Birth of the deceased person
    # @Format : YYYY-MM-DD
    dateOfBirth : Date,
    
    # Date of Death of the deceased person 
    # @Format : YYYY-MM-DD
    dateOfDeath : Date,
    
    # Home Town details of deceased person - Address 
    address : String,
    
    # Home Town details of deceased person - City 
    city : String,
    
    # Home Town details of deceased person - State
    state : String,
    
    # Home Town details of deceased person - Country
    country : String
    
    # Home Town details of deceased person - Zip
    zipcode : String
    
    # Some personal description about the deceased person
    description: String,
    
    # Users that created/modified this entry 
    # @Format : fullName - emailID
    addedBy : String!
    
    # Notes given by user while modifying/creating this entry
    editorNotes : String!
    
    # Edit ID that is being referred
    editID: String
}

`;


const queries = `

    # @Description : Get the information of the deceased person by name
    # @Input : 
    #   firstName   -   firstName of the deceased person
    #   lastName    -   Last name of the deceased person
    #   limit       -   No. of records that should be returned
    #   offset      -   No. of records that should be skipped           
    # @Token : accessToken
    # @Scope : [client:read]/[admin:read]
    # @Returns : List of deceased person object
    getDeceasedByName (firstName : String ,lastName : String,limit : Int ,offset: Int) : [Deceased]
    
    # @Description : Get the unverified list of deceased person
    # @Input : 
    #   limit       -   No. of records that should be returned
    #   offset      -   No. of records that should be skipped           
    # @Token : accessToken
    # @Scope : [admin:read]
    # @Returns : List of deceased person object
    getUnVerfiedDeceasedPerson (limit : Int ,offset: Int) : [Deceased]
    
    
    # @Description : Get the information of the deceased person by ID
    # @Input : 
    #   id : Deceased person Object ID as represented in database
    # @Token : accessToken
    # @Scope : [client:read]/[admin:read]
    # @Returns : Deceased person object
    getDeceasedById (id : String) : Deceased
`;


const mutations = `
    # @Description : Create a new entry for an individual
    # @Input : personJSON - Input structure to create a deceased person entry
    # @Token : accessToken
    # @Scope : [client:create]/[admin:create]
    # @Returns : created deceased person object
    createDeceasedPerson (data : personJSON!) : Deceased 
    
    # @Description : Edit already existing deceased person entry
    # @Input : editPersonJSON - Input structure to edit a deceased person entry
    # @Token : accessToken
    # @Scope : [admin:edit]
    # @Returns : edited deceased person object
    editDeceasedPerson (data : editPersonJSON!) : Deceased
    
    # @Description : Verify the deceased person entry 
    # @Input : deceasedID (that is needed to be verified)- Object ID as represented in database  
    # @Token : accessToken
    # @Scope : [admin:edit]
    # @Returns : verified deceased person entry
    verifyDeceasedPerson(id : String!) : Deceased
`;

export { types as dt, queries as dq, mutations as dm };
