import React, {Component} from 'react';
import {Query} from 'react-apollo';
import {getDeceasedById} from "../graphql/queries";
import UserView from "../components/UserView";
import Reactotron from 'reactotron-react-native';

import LoadingIndicator from "../components/LoadingIndicator";
import {Text} from "react-native";

class UserDetails extends Component {
    constructor(props) {
        super(props);
        this.state ={
            dateOfBirth:"N.A",
            dateOfDeath:"N.A",
            description:"Description not available",
            data:{},
        };
        Reactotron.log(props);
    }

    render() {
        return (
            <Query query={getDeceasedById} variables={{
                id: this.props.navigation.state.params.id
            }}>
                {
                    ({loading, data: {getDeceasedById}}) => {
                        if (loading) return (<LoadingIndicator/>);
                        Reactotron.log(getDeceasedById);
                        return (
                            <UserView data={getDeceasedById} navigation={this.props.navigation}/>
                        )
                    }
                }
            </Query>
        );
    }
}



export default UserDetails;
