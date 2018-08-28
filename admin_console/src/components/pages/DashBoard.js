import React, { Component } from "react";
import Menu from "../Menu";
import { ApolloProvider } from "react-apollo";
import { setContext } from "apollo-link-context/lib/index";
import { ApolloClient } from "apollo-client/index";
import { createHttpLink } from "apollo-link-http/lib/index";
import { api } from "../../config/init";
import { setupCache } from "../../config/apolloConfig";
import { Tab } from 'semantic-ui-react';
import EditTabs from "../edits/EditTabs";
import VerifyTabs from "../verify/VerifyTabs";
import AcceptAdmin from "../AcceptAdmin";



const panes = [
  { menuItem: 'Edit List', render: () => <Tab.Pane><EditTabs/></Tab.Pane> },
  { menuItem: 'Verify Entry', render: () => <Tab.Pane><VerifyTabs/></Tab.Pane> },
  { menuItem: 'Accept Admin', render: () => <Tab.Pane><AcceptAdmin/></Tab.Pane> },
];



class DashBoard extends Component {

  state={
    client : null,
    errors : null,

  };
  async componentDidMount() {
    if (localStorage.getItem("ACCESS_TOKEN")) {
      const {errors,cache} = await setupCache();
      const httpLink = createHttpLink({
        uri: api.URL
      });
      if(errors){
        this.setState({errors})
      }
      const authLink = setContext((_, { headers }) => {
        // get the authentication token from local storage if it exists
        const token = localStorage.getItem("ACCESS_TOKEN");
        // return the headers to the context so httpLink can read them
        return {
          headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : ""
          }
        };
      });

      const defaultOptions = {
        watchQuery: {
          fetchPolicy: 'cache-and-network',
        },
        query: {
          fetchPolicy: 'cache-and-network',
        },
        mutate: {
          fetchPolicy: 'no-cache',
        },
      };

      const client = new ApolloClient({
        link: authLink.concat(httpLink),
        cache,
        defaultOptions
      });

      this.setState({client:client})

    } else {
      this.props.history.push("/login");
    }
  }

  render() {
    let {client} = this.state;
    if (this.state.client !== null) {
      return (
        <div>
          <Menu active="dashboard"/>
          <ApolloProvider client={client}>
            <Tab panes={panes} />
          </ApolloProvider>
        </div>
      );
    }
    return <p>Loading</p>;
  }
}

export default DashBoard;
