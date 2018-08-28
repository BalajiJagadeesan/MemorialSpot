import  React, { Component } from "react";
import { Tab } from "semantic-ui-react";
import EditsEntry from "./EditsList";

const panes = [
  { menuItem: "edits:Deceased Person", render: () => <Tab.Pane><EditsEntry type="DECEASED_PERSON"/></Tab.Pane> },
  { menuItem: "edits:Deceased Person Images", render: () => <Tab.Pane><EditsEntry type="DECEASED_PERSON_IMAGE"/></Tab.Pane> },
  { menuItem: "edits:Memorials", render: () => <Tab.Pane><EditsEntry type="MEMORY"/></Tab.Pane> },
  { menuItem: "edits:Memorials Images", render: () => <Tab.Pane><EditsEntry type="MEMORY_IMAGE"/></Tab.Pane> },
  { menuItem: "edits:Location", render: () => <Tab.Pane><EditsEntry type="LOCATION"/></Tab.Pane> }
];

class EditTabs extends Component {
  render() {
    let headers = {"Authorization" : "Bearer "+localStorage.getItem("ACCESS_TOKEN")};
    return (
      <div>
        <p>
          All the edits to an entry are listed here.Please use the
          <a href="https://github.com/graphcool/graphql-playground/releases" target="_blank"> GraphiQL editor </a>
           to mutate the entry
        </p>
        <p>Archive the edit after modifying by invoking archiveEdit() mutation</p>
        <p>Set access token from localStorage as "Authorization":"Bearer /token/" in HTTP header of GraphiQL before invoking operations </p>
        <Tab panes={panes} renderActiveOnly/>
      </div>
    );
  }
}

export default EditTabs;
