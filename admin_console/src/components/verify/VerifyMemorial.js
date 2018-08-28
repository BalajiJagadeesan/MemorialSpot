import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";
import { getUnVerfiedMemoryList } from "../../graphql/queries";
import { Button, Message } from "semantic-ui-react";
import { verifyMemorial } from "../../graphql/mutations";
import { cycleErrors } from "../../config/helpers";
import Error from "../Errors";
import _ from "lodash";

class VerifyMemorial extends Component {
  render() {
    return (
      <div>
        <Query query={getUnVerfiedMemoryList} variables={{ limit: 5, offset: 0 }}>
          {({ loading: queryLoading, error: queryError, data: { getUnVerfiedMemorials }, refetch }) => {
            if (queryLoading) return "Loading List";
            if (queryError) return (<div className="ui vertical segment">
              <Message className="ui segment" error>
                <Message.Header>Error</Message.Header>
                <Error errors={cycleErrors(queryError.graphQLErrors)}/>
              </Message></div>);

            if (_.isEmpty(getUnVerfiedMemorials)) {
              return (<div><p>No Pending Requests</p></div>);
            }

            return (<Mutation mutation={verifyMemorial}>
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
                      <p>{data.verifyMemory.id} {data.verifyMemory.deceasedPerson.firstName}
                      {data.verifyMemory.deceasedPerson.lastName}'s {data.verifyMemory.memoryType} is verified.
                      </p>
                      <Button onClick={()=>{refetch()}}> Go Back</Button>
                    </Message></div>);
                }

                return (
                  <div className="ui vertical segment">
                    {getUnVerfiedMemorials.map((record, index) => {
                      return (
                        <div key={index} className="ui segment">
                          <p>ID : {record.id}</p>
                          <p>Memorial belongs to : {record.deceasedPerson.firstName} {record.deceasedPerson.lastName}</p>
                          <p>Memorial Type : {record.memoryType}</p>
                          <p>ErectedOn : {record.erectedOn}</p>
                          <p>ErectedBy : {record.erectedBy}</p>
                          <Button primary onClick={() => {
                            acceptRequest({ variables: { id: record.id } });
                          }}>Verify Memorial</Button>
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

export default VerifyMemorial;
