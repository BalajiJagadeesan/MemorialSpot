const types = `

    #@Description: Testimonials by relatives
    type Note {
        # ID of the entry
        id : ID
        
        # Name of the person writing the note
        nameOfPerson : String,
        
        # Valid email id of the person for confirmation
        emailID : Email,
        
        #Personal Note 
        note : String,
        
        # To which deceased person it corresponds to 
        deceasedPerson : Deceased,
        
        # The time this entry was added to the database
        createdAt : DateTime
    }
    
    #@Description: Input Object to create new a new note
    input noteJSON{
    
        # Name of the person writing the note
        nameOfPerson : String!,
        
        # Valid email id of the person for confirmation
        emailID : Email!,
        
        #Personal Note 
        note : String!,
        
        # To which deceased person it corresponds to 
        deceasedID : String!,
    }
`;

const queries = `

    
    # @Description : Get the information of the note by ID
    # @Input : 
    #   id :  Note Object ID as represented in database
    # @Token : accessToken
    # @Scope : [client:read]/[admin:read]
    # @Returns : List of Note Objects
    getNotesById (id : String!) : Note
    
    # @Description : Get list of notes
    # @Input : 
    #   limit: The number of records to be returned
    #   offset: The number of records to be skipped
    # @Token : accessToken
    # @Scope : [client:read]/[admin:read]
    # @Returns : List of Note Objects
    getNotes (limit:Int!,offset:Int!) : [Note]
    
`;

const mutations = `
    # @Description : Create a new note entry
    # @Input : personJSON - Input structure to create a note
    # @Token : accessToken
    # @Scope : [client:create]/[admin:create]
    # @Returns : created note
    createANote (data:noteJSON) : Note
`;

export { types as nt, queries as nq, mutations as nm };
