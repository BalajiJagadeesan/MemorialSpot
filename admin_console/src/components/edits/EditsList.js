import React, { Component } from "react";
import {  Grid } from "semantic-ui-react";
import { getEdits } from "../../graphql/queries";
import { Query } from "react-apollo";
import Error from "../Errors";
import { cycleErrors } from "../../config/helpers";

class EditsDeceasedPerson extends Component {
  render() {
    const {type} = this.props;
    return (
      <div>
        <Grid>
          <Grid.Column width={6}>
            <Query query={getEdits} variables={{ type: type, limit: 10, offset: 0 }}>
              {({ error, loading, data: { getEditsByType } }) => {
                if (loading) return ("Loading");
                if (error) return (<Error errors={cycleErrors(error.graphQLErrors)}/>);
                if (getEditsByType.length === 0) {
                  return (<div><p>No Pending Edits</p></div>);
                }
                return (<div className="ui vertical segment">
                  {getEditsByType.map((record, index) => {
                    return (<div  key={index} className="ui segment">
                      <p>ID : {record.correspondingID}</p>
                      <p>Edit ID : {record.id}</p>
                      <p>Change Field : {record.entryField}</p>
                      <p>To value : {record.entryFieldValue}</p>
                      <p>Description: {record.description}</p>
                      <p>Editor Name: {record.editorName}</p>
                      <p>Editor Email ID: {record.emailID}</p>
                    </div>);
                  })
                  }
                </div>);
              }}
            </Query>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}


export default EditsDeceasedPerson;
