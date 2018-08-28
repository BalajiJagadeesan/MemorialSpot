import gql from 'graphql-tag';


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

const noteFragment = `
fragment noteFragment on Note{
    id
    nameOfPerson
    emailID
    note
    createdAt
}
`;

const adminFragment = `
fragment adminFragment on Admin{
    id
    fullName
    emailID
    address
    socialMedia
    acceptedOn
}
`;


const getDeceasedByName = gql`
query getDeceasedByName(
    $firstName:String,
	$lastName:String,
    $limit: Int,
    $offset:Int)
{
    getDeceasedByName(
        firstName:$firstName,
        lastName:$lastName,
        limit:$limit,
        offset:$offset
        ){
            id
            firstName
            lastName
            profilePic
            dateOfBirth
            dateOfDeath
        }	
}
`;

const getMemoryByType = gql`
query getMemoryByType($type:memory_type!,$limit:Int,$offset:Int){
  getMemoryByType(type:$type,limit:$limit,offset:$offset){
    id
    deceasedPerson{
      id
      firstName
      lastName
      dateOfBirth
      dateOfDeath
      profilePic
    }
  }
}
`;

const getNearByLocations = gql`
query getNearByLocation($lat:String,$long:String){
  getNearByLocation(lat:$lat,long:$long){
	    id
	    latitude 
	    longitude
    	memory{
    	    id
    	    memoryType
    	    memoryImageURL
    	    deceasedPerson{
    	    	id
    	    	firstName
    	    	lastName
    	    	dateOfBirth
    	    	dateOfDeath
      		}
    	}
	}
}
`;

const getDeceasedById = gql`
query getDeceasedById($id: String!){
    getDeceasedById(id:$id){
        ...personFragment
        verifiedBy{
            ...adminFragment
        }
        personalNote{
            ...noteFragment
        }
        memories{
            ...memoryFragment
             verifiedBy{
                ...adminFragment
            }
            location{
                ...locationFragment
                verifiedBy{
                    ...adminFragment
                }
            }
        }
    }
}
${locationFragment}
${adminFragment}
${memoryFragment}
${personFragment}
${noteFragment}

`;


export {getDeceasedByName, getMemoryByType, getNearByLocations, getDeceasedById};
