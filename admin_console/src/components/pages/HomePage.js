import React, { Component } from "react";
import Menu from "../Menu";

class HomePage extends Component {
  render() {
    return (<div className="">
        <Menu active="hompage"/>
        <h1>Home Page</h1>
        <p>This is the administrative console for the MemorialSpot Mobile Application</p>
        <p>You can sign up to become one of the moderators through the MemorialSpot App</p>
      </div>
    );
  };
}

export default HomePage;
