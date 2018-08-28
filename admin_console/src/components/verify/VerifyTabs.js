import React, { Component } from "react";
import { Tab } from "semantic-ui-react";
import VerifyDeceasedEntry from "./VerifyDeceasedEntry";
import VerifyMemorial from "./VerifyMemorial";
import VerifyLocation from "./VerifyLocation";

const panes = [
  { menuItem: "Deceased", render: () => <Tab.Pane><VerifyDeceasedEntry/></Tab.Pane> },
  { menuItem: "Memorial", render: () => <Tab.Pane><VerifyMemorial/></Tab.Pane> },
  { menuItem: "Location", render: () => <Tab.Pane><VerifyLocation/></Tab.Pane> }
];

class VerifyTabs extends Component {
  render() {
    return (
      <div>
        <Tab panes={panes} renderActiveOnly/>
      </div>
    );
  }
}

export default VerifyTabs;
