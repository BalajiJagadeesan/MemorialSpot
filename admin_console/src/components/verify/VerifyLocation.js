import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";
import { getUnVerfiedLocationList } from "../../graphql/queries";
import { Button, Message } from "semantic-ui-react";
import { verifyLocation } from "../../graphql/mutations";
import { cycleErrors } from "../../config/helpers";
import Error from "../Errors";
import _ from "lodash";

class VerifyLocation extends Component {
  render() {
    return (
      <div>
        <Query query={getUnVerfiedLocationList} variables={{ limit: 5, offset: 0 }}>
          {({ loading: queryLoading, error: queryError, data: { getUnVerfiedLocation }, refetch }) => {
            if (queryLoading) return "Loading List";

            if (queryError) return (<div className="ui vertical segment">
              <Message className="ui segment" error>
                <Message.Header>Error</Message.Header>
                <Error errors={cycleErrors(queryError.graphQLErrors)}/>
              </Message></div>);

            if (_.isEmpty(getUnVerfiedLocation)) {
              return (<div><p>No Pending Requests</p></div>);
            }

            return (<Mutation mutation={verifyLocation}>
              {(acceptRequest, { data, loading: mutationLoading, error: mutationError }) => {
                if (mutationLoading) return "Updating value in server";

                if (mutationError) return (<div className="ui vertical segment">
                  <Message className="ui segment" error>
                    <Message.Header>Error</Message.Header>
                    <Error errors={cycleErrors(mutationError.graphQLErrors)}/>
                    <Button onClick={() => {
                      refetch();
                    }}> Go Back</Button>
                  </Message></div>);

                if (data) {
                  return (<div className="ui vertical segment">
                    <Message className="ui segment" positive>
                      <Message.Header>Success</Message.Header>
                      <p>{data.verifyLocation.memory.deceasedPerson.firstName} {data.verifyLocation.memory.deceasedPerson.lastName}'s
                        memorial({data.verifyLocation.memory.memoryType}) location
                        ({data.verifyLocation.id}) is verified.
                      </p>
                      <Button onClick={() => {
                        refetch();
                      }}> Go Back</Button>
                    </Message></div>);
                }

                return (
                  <div className="ui vertical segment">
                    {getUnVerfiedLocation.map((record, index) => {
                      return (
                        <div key={index} className="ui segment">
                          <p>Location ID : {record.id}</p>
                          <p>Latitude : {record.latitude} </p>
                          <p>Longitude : {record.longitude} </p>
                          <p>Memorial belongs to
                            : {record.memory.deceasedPerson.firstName} {record.memory.deceasedPerson.lastName}</p>
                          <p>Memorial Type : {record.memory.memoryType}</p>
                          <Button primary onClick={() => {
                            acceptRequest({ variables: { id: record.id } });
                          }}>Verify Location</Button>
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

export default VerifyLocation;
