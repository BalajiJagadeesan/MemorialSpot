const types = `
# @Description: Object that defines the changes to be made to entries
type Edit {

    # Object ID of this entry as represented in the database 
    id : ID,
    
    # General context of what you want to edit/add as defined by object entry
    nameOfEntry : entry
    
    # ID of the entry that needs editing ( DeceasedID/MemoryID/LocationID )
    correspondingID : String
    
    # The attribute of the entry that wants to be edited 
    entryField : String,
    
    # The value of the attribute to be edited
    entryFieldValue : String,
    
    # Some information to justify the modification of attribute in the entry
    description : String,
    
    # Name of the user who created this entry
    editorName : String!, 
    
    # Email ID of the user who created this entry
    emailID : Email!,
    
    # The date that this edit was created.
    createdAt : Date
}

# enum of the entry 
enum entry {
    # Context of deceased person entry
    DECEASED_PERSON,
    # Context of image of deceased person entry
    DECEASED_PERSON_IMAGE,
    # Context of memory entry
    MEMORY,
    # Context of images of memory entry
    MEMORY_IMAGE,
    # Context of location entry
    LOCATION
}

# @Description : Input structure to create an edits entry
#
# @Example  : {
#   //Deceased Person 
#   nameOfEntry     : DECEASED_PERSON @Required 
#   //So should be a valid deceased person entry
#   correspondingID : "54759eb3c090d83494e2d804",@Required  
#   entryField      : "dateOfBirth", @Required
#   entryFieldValue : "1950-04-04", @Required
#   description     : "Real birth date of the deceased person according to birth certificate" @Required
#   editorName      : "John Walker", @Required
#   emailID         : "john_walker@gmail.com", @Required
input editsJSON {
    # General context of what you want to edit/add as defined by object entry
    nameOfEntry : entry!,
    
    # ID of the entry that needs editing ( DeceasedID/MemoryID/LocationID )
    correspondingID : String!,
    
    # The attribute of the entry that wants to be edited 
    entryField : String!,
    
    # The value of the attribute to be edited
    entryFieldValue : String!,
    
    # Some information to justify the modification of attribute in the entry
    description : String!,
    
    # Name of the user who created this entry
    editorName : String!, 
    
    # Email ID of the user who created this entry
    emailID : Email!,
    
}
`;

const queries = `

    # @Description : Get the information of the edits by ID
    # @Input : 
    #   id : Edits Object ID as represented in database @Required
    # @Token : accessToken
    # @Scope : [client:read]/[admin:read]
    # @Returns : Edit Object
    getEditsById (id : String!) : Edit
    
    # @Description : Get the latest edits 
    # @Input : 
    #   limit   - No. of records that should be returned @Required
    #   offset  - No. of records that should be skipped @Required         
    # @Token : accessToken
    # @Scope : [client:read]/[admin:read]
    # @Returns : List of Edit entries
    getEdits (limit:Int!,offset:Int!) : [Edit]
    
    # @Description : Archived edit entry 
    # @Input : 
    #   limit   - No. of records that should be returned @Required
    #   offset  - No. of records that should be skipped @Required         
    # @Token : accessToken
    # @Scope : [client:read]/[admin:read]
    # @Returns : List of Edit entries
    getArchive (limit:Int!,offset:Int!) : [Edit]
    
    # @Description : Get the edits by context types
    # @Input : 
    #   context - type of context
    #   limit   - No. of records that should be returned
    #   offset  - No. of records that should be skipped           
    # @Token : accessToken
    # @Scope : [client:read]/[admin:read]
    # @Returns : List of deceased person object
    getEditsByType (type : entry ,limit : Int , offset : Int) : [Edit]
`;

const mutations = `

    # @Description : Create a new entry for an edit
    # @Input : editsJSON - Input structure to create a edit entry
    # @Token : accessToken
    # @Scope : [client:create]/[admin:create]
    # @Returns : created edit entry
    createEdits (data:editsJSON) : Edit
    
    # @Description : Archive an Edit Entry
    # @Input : ID - Edit ID
    # @Token : accessToken
    # @Scope : [client:create]/[admin:create]
    # @Returns : Archived Edit Entry
    archiveEdit (id:String) : Edit
    
`;


export { types as et, queries as eq, mutations as em };
