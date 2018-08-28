import gql from "graphql-tag";

const refreshAdminToken = gql`
    mutation{
        refreshAdminToken
    }
`;

const acceptAdmin = gql`
mutation acceptAdmin($id:String!){
    acceptAdmin(id:$id){
        emailID
        id
    }	
}
`;

const verifyDeceasedPerson = gql`
  mutation($id : String!){
    verifyDeceasedPerson (id:$id){
      id
      firstName
      lastName
    }
  }
`;

const verifyMemorial = gql`
  mutation($id : String!){
    verifyMemory (id:$id){
      id
      memoryType
      deceasedPerson{
        firstName
        lastName
      }
    }
  }
`;
const verifyLocation = gql`
  mutation($id : String!){
    verifyLocation (id:$id){
      id
      memory{
        memoryType
        deceasedPerson{
          firstName
          lastName
        }
      }
    }
  }
`;
export {
  acceptAdmin,
  verifyMemorial,
  verifyDeceasedPerson,
  refreshAdminToken,
  verifyLocation
};
