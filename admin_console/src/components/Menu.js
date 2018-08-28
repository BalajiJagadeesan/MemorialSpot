import React, { Component } from "react";
import { Menu } from "semantic-ui-react";
import { Link } from "react-router-dom";

export default class MenuExampleMenus extends Component {
  state = {};

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    const {active} = this.props;

    return (
      <Menu stackable>
        <Menu.Item as={Link} to='/' name='home' onClick={this.handleItemClick} header>
          MemorialSpot Console
        </Menu.Item>

        <Menu.Menu position='right'>
          {localStorage.getItem("ACCESS_TOKEN") ?
            <Menu.Item as={Link} name='dashboard' to='/dashboard' active={active === "dashboard"}
                       onClick={this.handleItemClick}>
            </Menu.Item>
            : <Menu.Item as={Link} name='help' to='/login' active={active === "login"}
                         onClick={this.handleItemClick}>
              Login
            </Menu.Item>
          }

        </Menu.Menu>
      </Menu>
    );
  }
}
