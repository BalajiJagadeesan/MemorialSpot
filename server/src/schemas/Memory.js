const types = `

#@Description :  Object that defines the information about a memorial artifact
type Memory{
    # Object ID of the entry as represented in the database
    id : ID,
    
    # Category of the memorial artifact
    memoryType : memory_type!,
    
    # List of images (represented as list of url)
    memoryImageURL : [String],
    
    # Deceased Person Object corresponding to this memory
    deceasedPerson : Deceased
    
    # The date in which the memorial was erected
    erectedOn : Date
    
    # Who erected it 
    erectedBy : [String]
    
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
    
    # Physical location of the memorial artifact
    location : Location
}

# @Description : Enum for the "type" of memory - Tree, Bench, Garden, Others
enum memory_type{
    # Memorial of category - Tree
    TREE,
    # Memorial of category - Bench
    BENCH,
    # Memorial of category - garden
    GARDEN
    # Unclassified memorial
    OTHER
}

# @Description : Input structure to create an entry for memory
input memoryJSON{
    # Category of the memorial artifact
    memoryType : memory_type!,
    
    #Location Image of the memory
    memoryImageURL : [String],
    
    #Person this memory belongs to
    deceasedID : String!
    
    # The day it was erected 
    erectedOn : Date
    
    # Who erected it 
    erectedBy : [String]
    
    # Users that created/modified this entry 
    # @Format : fullName - emailID
    addedBy : String!
    
    # Notes given by user while modifying/creating this entry
    editorNotes : String!
}

#@Description : Input structure to edit a memory entry
input editMemoryJSON{

    #id of the entry
    id  :   String
    
    #Type of memory
    memoryType : memory_type,
    
    #Location Image of the memory
    memoryImageURL : [String],
    
    #Person this memory belongs to
    deceasedID : String
    
    # The day it was erected 
    erectedOn : Date
    
    # Who erected it 
    erectedBy : [String]
    
    #person who added the info [Format : person name - emailid ]
    addedBy : String!
    
    #Contribution/Changes made recently by editors
    editorNotes : String!
    
    # Edit ID that is being referred
    editID: String
}
`;

const queries = `
    
    # @Description : Get the memory based on memory type
    # @Input : 
    #   type : memory_type of the memory
    # @Token : accessToken
    # @Scope : [client:read]/[admin:read]
    # @Returns : List of Memory object
    getMemoryByType (type : memory_type,limit:Int, offset:Int) : [Memory]
    
    # @Description : Get the unverified list of memory
    # @Input : 
    #   limit       -   No. of records that should be returned
    #   offset      -   No. of records that should be skipped           
    # @Token : accessToken
    # @Scope : [admin:read]
    # @Returns : List of deceased person object
    getUnVerfiedMemorials (limit : Int ,offset: Int) : [Memory]
    
    
    # @Description : Get the information of the memory by ID
    # @Input : 
    #   id : Deceased person Object ID as represented in database
    # @Token : accessToken
    # @Scope : [client:read]/[admin:read]
    # @Returns : Memory object
    getMemoryById (id: String!) : Memory
   
`;


const mutations = `
    # @Description : Create a new memory entry in the database
    # @Input : memoryJSON - Input structure to create a memory entry
    # @Token : accessToken
    # @Scope : [client:create]/[admin:create]
    # @Returns : created memory object
    createMemory (data : memoryJSON!) : Memory
    
    # @Description : Edit a memory entry in the database
    # @Input : editMemoryJSON - Input structure to edit a memory entry
    # @Token : accessToken
    # @Scope : [admin:edit]
    # @Returns : edited memory object
    editMemory (data:editMemoryJSON!) : Memory
    
    # @Description : Verify the memory entry 
    # @Input : deceasedID (that is needed to be verified)- Object ID as represented in database  
    # @Token : accessToken
    # @Scope : [admin:edit]
    # @Returns : verified memory person entry
    verifyMemory(id : String! ) : Memory
`;

export { types as mt, queries as mq, mutations as mm };
