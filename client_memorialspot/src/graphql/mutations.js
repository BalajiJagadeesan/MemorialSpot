import gql from 'graphql-tag';


const createDeceasedPerson = gql`
mutation createDeceasedPerson(
$firstName: String!
$lastName: String!
$profilePic: String
$dateOfBirth: Date
$dateOfDeath: Date
$address: String
$city: String
$state: String
$country: String
$zipcode: String
$description: String
$addedBy: String!
$editorNotes: String!
){
  createDeceasedPerson(data:{
	firstName:$firstName,
    lastName: $lastName,
    profilePic:$profilePic,
    dateOfBirth: $dateOfBirth,
    dateOfDeath: $dateOfDeath,
    address:$address,
    city: $city,
    state: $state,
    country:$country,
    zipcode:$zipcode,
    description: $description,
  	addedBy: $addedBy,
    editorNotes: $editorNotes,
  }){
  	id
	}
}
`;

const registerUser = gql`
    mutation registerClient($guid: String!) {
        registerClient(data: {guid: $guid}) {
            token
            refreshToken
        }
    }
`;

const refreshClientToken = gql`
    mutation{
        refreshClientAccessToken
    }
`;
const createEditsEntry = gql`
mutation createEdits(
  $nameOfEntry: entry!
	$correspondingID: String!
	$entryField: String!
	$entryFieldValue: String!
	$description: String!
	$editorName: String!
	$emailID: Email!
){
  createEdits(data:{
    nameOfEntry : $nameOfEntry, 
		correspondingID: $correspondingID,
		entryField: $entryField,
		entryFieldValue: $entryFieldValue,
		description: $description,
		editorName: $editorName,
		emailID: $emailID
  }){
    id
  }
}
`;

const createMemory = gql`
mutation createMemory(
  $memoryType: memory_type!
	$memoryImageURL: [String]
	$deceasedID: String!
	$erectedOn: Date
	$erectedBy: [String]
	$addedBy: String!
	$editorNotes: String!
){
  createMemory(data:{
  	memoryType:$memoryType,
		memoryImageURL: $memoryImageURL,
		deceasedID: $deceasedID,
		erectedOn: $erectedOn,
		erectedBy: $erectedBy,
		addedBy: $addedBy,
		editorNotes: $editorNotes
  }){
    id
  	}
}
`;

const createLocation = gql`
mutation createLocation(
	$latitude: String
	$longitude: String
	$memoryID: String!
	$addedBy: String!
	$editorNotes: String!
){
  createLocation(data : {
		latitude:$latitude,
    longitude:$longitude,
    memoryID:$memoryID,
    addedBy:$addedBy,
    editorNotes:$editorNotes
  }){
    id
  }
}
`;
const createANote = gql`
mutation createANote(
  $nameOfPerson: String!
	$emailID: Email!
	$note: String!
	$deceasedID: String!
){
  createANote(data:{
  	nameOfPerson : $nameOfPerson,
    emailID:$emailID,
    note:$note,
    deceasedID: $deceasedID,
  }){
    id
  }
}
`;

const requestToBeAdmin = gql`
mutation requestToBeAdmin(
    $fullName: String!
    $emailID: String!
    $address: String
    $socialMedia: [String!]!
){
    requestToBeAdmin(data:{
        fullName: $fullName
        emailID: $emailID
        address: $address
        socialMedia: $socialMedia
    }){
        id
    }
}
`;
export {
    createDeceasedPerson,
    refreshClientToken,
    registerUser,
    createEditsEntry,
    createANote,
    createMemory,
    createLocation,
    requestToBeAdmin
};
