import React, { Component } from "react";
import { GoogleLogin } from "react-google-login";
import Menu from "../Menu";
import { api } from "../../config/init";
import { Grid, Message } from "semantic-ui-react";
import _  from 'lodash';
class LoginPage extends Component {

  constructor(props) {
    super(props);
  }

  state = {
    data: {
      email: "",
      password: ""
    },
    loading: false,
    errors: {},
    error: ""
  };

  responseGoogle = async (response) => {
    let accessTokens = await fetch(api.LOGIN, {
      method: "post",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token: response.tokenId })
    });
    let data = await accessTokens.json();
    if (_.isEmpty(data.token)) {
      this.setState({ error: "Login Failed :" + data.data.errorMessage });
    } else {
      await localStorage.setItem("ACCESS_TOKEN", data.token);
      await localStorage.setItem("REFRESH_TOKEN", data.refreshToken);
      this.props.history.push("/dashboard");
    }
  };

  render() {
    const { error } = this.state;
    return <div>
      <Menu active="login"/>
      <Grid container columns="equal">
        {(error) ? <Grid.Row>
            <Grid.Column width={3}></Grid.Column>
            <Grid.Column width={10}>
              <Message negative>
                <Message.Header>Error</Message.Header>
                <p>{error}</p>
              </Message>
            </Grid.Column>
            <Grid.Column width={3}></Grid.Column>
          </Grid.Row>
          : null}
        <Grid.Row>
          <Grid.Column width={3}></Grid.Column>
          <Grid.Column width={10} verticalAlign="middle" textAlign="center">
            <h1>Login </h1>
            <GoogleLogin
              clientId="269114992009-27vkhbr1p84ibb2p1er6hd0jc8vhchl2.apps.googleusercontent.com"
              buttonText="Google User Login"
              scope="profile"
              onSuccess={this.responseGoogle}
              onFailure={this.responseGoogle}
            />
          </Grid.Column>
          <Grid.Column width={3}></Grid.Column>
        </Grid.Row>
      </Grid>
    </div>;
  }
}

export default LoginPage;
