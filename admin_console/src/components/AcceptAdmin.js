import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";
import { listPendingRequest } from "../graphql/queries";
import { Button, Message } from "semantic-ui-react";
import { acceptAdmin } from "../graphql/mutations";
import { cycleErrors } from "../config/helpers";
import _ from "lodash";
import Error from "./Errors";

class AcceptAdmin extends Component {
  render() {
    return (
      <div>
        <Query query={listPendingRequest}>
          {({ loading: queryLoading, error: queryError, data: { getPendingRequests }, refetch }) => {
            if (queryLoading) return "Loading List";

            if (queryError) return (<div className="ui vertical segment">
              <Message className="ui segment" error>
                <Message.Header>Error</Message.Header>
                <Error errors={cycleErrors(queryError.graphQLErrors)}/>
              </Message></div>);

            if (_.isEmpty(getPendingRequests)) {
              return (<div><p>No Pending Requests</p></div>);
            }
            return (<Mutation mutation={acceptAdmin}>
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
                      <p>{data.acceptAdmin.emailID} is accepted to become one of the moderators.
                      </p>
                      <Button onClick={() => {
                        refetch();
                      }}> Go Back</Button>
                    </Message></div>);
                }

                return (<div className="ui vertical segment">
                  {getPendingRequests.map((record, index) => {
                    return (<div className="ui segment">
                      <p>ID : {record.id}</p>
                      <p>Full Name : {record.fullName}</p>
                      <p>Email ID : {record.emailID}</p>
                      <p>Social Media : {record.socialMedia}</p>
                      <Button primary onClick={() => {
                        acceptRequest({ variables: { id: record.id } });
                      }}>Accept Admin</Button>
                    </div>);
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

export default AcceptAdmin;
