import gql from "graphql-tag";


const personFragment = `
fragment personFragment on Deceased{
    id
    firstName
    lastName
    profilePic
    dateOfBirth
    dateOfDeath
    address
    city
    state
    country
    zipcode
    description
    addedBy
    editorNotes
    updatedAt
    createdAt
    isVerified
}
`;

const memoryFragment = `
fragment memoryFragment on Memory{
    id
    memoryType
    memoryImageURL
    erectedOn
    erectedBy
    addedBy
    editorNotes
    updatedAt
    createdAt
    isVerified
}
`;

const locationFragment = `
fragment locationFragment on Location{
    id
    latitude
    longitude
    addedBy
    editorNotes
    updatedAt
    createdAt
    isVerified
}
`;

const listPendingRequest = gql`
  query{
    getPendingRequests{
      id
      fullName
      emailID
      address
      socialMedia
    }
  }
`;

const getUnVerfiedPersonList = gql`
  query ($limit: Int, $offset: Int){
    getUnVerfiedDeceasedPerson(limit: $limit, offset: $offset){
      ...personFragment
    }
  }
  ${personFragment}

`;

const getUnVerfiedMemoryList = gql`
  query ($limit: Int, $offset: Int){
    getUnVerfiedMemorials(limit: $limit, offset: $offset){
      ...memoryFragment
      deceasedPerson{
        id
        firstName
        lastName
      }
    }
  }
  ${memoryFragment}
`;

const getUnVerfiedLocationList = gql`
  query ($limit: Int, $offset: Int){
    getUnVerfiedLocation(limit: $limit, offset: $offset){
      ...locationFragment
      memory{
        id
        memoryType
        deceasedPerson{
          id
          firstName
          lastName
        }
      }
    }
  }
  ${locationFragment}
`;
const getEdits = gql`
  query getEditsByType($type:entry, $limit: Int, $offset: Int){
    getEditsByType(type:$type,limit: $limit, offset: $offset){
      id
      correspondingID
      entryField
      entryFieldValue
      description
      editorName
      emailID	
    }
  }
`;

export {
  listPendingRequest,
  getEdits,
  getUnVerfiedPersonList,
  getUnVerfiedLocationList,
  getUnVerfiedMemoryList
};
