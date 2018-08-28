import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";
import { getUnVerfiedPersonList } from "../../graphql/queries";
import { Button, Message } from "semantic-ui-react";
import { verifyDeceasedPerson } from "../../graphql/mutations";
import { cycleErrors } from "../../config/helpers";
import Error from "../Errors";
import _ from "lodash";

class VerifyDeceasedEntry extends Component {
  render() {
    return (
      <div>
        <Query query={getUnVerfiedPersonList} variables={{ limit: 5, offset: 0 }}>
          {({ loading: queryLoading, error: queryError, data: { getUnVerfiedDeceasedPerson }, refetch }) => {
            if (queryLoading) return "Loading List";

            if (queryError) return (<div className="ui vertical segment">
              <Message className="ui segment" error>
                <Message.Header>Error</Message.Header>
                <Error errors={cycleErrors(queryError.graphQLErrors)}/>
              </Message></div>);

            if (_.isEmpty(getUnVerfiedDeceasedPerson)) {
              return (<div><p>No Pending Requests</p></div>);
            }

            return (<Mutation mutation={verifyDeceasedPerson}>
              {(acceptRequest, { data, loading: mutationLoading, error: mutationError }) => {
                if (mutationLoading) return "Updating value in server";

                if (mutationError) return (<div className="ui vertical segment">
                  <Message className="ui segment" error>
                    <Message.Header>Error</Message.Header>
                    <Error errors={cycleErrors(mutationError.graphQLErrors)}/>
                    <Button onClick={()=>{refetch()}}> Go Back</Button>
                  </Message></div>);

                if (data) {
                  return (<div className="ui vertical segment">
                    <Message className="ui segment" positive>
                      <Message.Header>Success</Message.Header>
                      <p>{data.verifyDeceasedPerson.id} entry of
                        person {data.verifyDeceasedPerson.firstName} {data.verifyDeceasedPerson.lastName} is verified
                      </p>
                      <Button onClick={()=>{refetch()}}> Go Back</Button>
                    </Message></div>);
                }

                return (
                  <div className="ui vertical segment">
                    {getUnVerfiedDeceasedPerson.map((record, index) => {
                      return (
                        <div key={index} className="ui segment">
                          <p>ID : {record.id}</p>
                          <p>Full Name : {record.firstName} {record.lastName}</p>
                          <p>Date of Birth : {record.dateOfBirth}</p>
                          <p>Date of Death : {record.dateOfDeath}</p>
                          <p>Profile Pic : {record.profilePic}</p>
                          <p>Address : {record.address} {record.city} {record.state} {record.country}</p>
                          <p>Description: {record.description}</p>
                          <p>Profile Pic : {record.profilePic}</p>
                          <Button primary onClick={() => {
                            acceptRequest({ variables: { id: record.id } });
                          }}>Verify Person</Button>
                        </div>
                      );
                    })
                    }
                  </div>);
              }}
            </Mutation>);
          }}
        </Query>
      </div>
    );
  }
}

export default VerifyDeceasedEntry;
