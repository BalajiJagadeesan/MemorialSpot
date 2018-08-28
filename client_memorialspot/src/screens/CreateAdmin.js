import React, {Component} from 'react';
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
} from 'react-native';
import {Input, Icon, Button} from 'react-native-elements'
import {colors, api} from "../config/init";
import Reactotron from 'reactotron-react-native';
import {Mutation} from "react-apollo";
import validator from 'validator';
import {requestToBeAdmin} from "../graphql/mutations";
import {cycleErrors} from "../config/helpers";
import ErrorComponent from "../components/ErrorComponent";

const initialState = {
    fullName: "",
    address: "",
    socialMedia: "",
    emailID: "",
    error: {},
};

class CreateAdmin extends Component {

    constructor(props) {
        super(props);
        this.state = initialState;
    }

    _setError(value) {
        this.setState((prevState) => {
            return {error: Object.assign({}, prevState.error, value)};
        });
    }

    async _validate() {
        this.setState({error: {}, submitStatus: "Validating"});

        if (!validator.matches(this.state.fullName, /^[A-Za-z'. ]{2,30}$/)) {
            this._setError({fullName: "This should be a valid name"})
        }
        if (!validator.isEmail(this.state.emailID)) {
            this._setError({emailID: "This should be a valid email id"})
        }

        if (!validator.isURL(this.state.socialMedia)) {
            this._setError({socialMedia: "This should be a valid URL"})
        }

        return {
            fullName: this.state.fullName,
            emailID: this.state.emailID,
            address: this.state.address,
            socialMedia: [this.state.socialMedia]
        }
    }


    render() {
        return (
            <Mutation mutation={requestToBeAdmin}
                      onError={() => {
                          this.setState({submitStatus: 'Server returned these errors'})
                      }}
                      onCompleted={(result) => {
                          if (result.requestToBeAdmin !== null) {
                              this.setState(initialState);
                              this.setState({submitStatus: "Applied.Please wait for mail from current administrator"});
                          } else {
                              this.setState({submitStatus: "Some validation error occurred on server-side."})
                          }
                      }}
            >
                {(createAdminRecord, {loading, error, data}) => {
                    // Reactotron.log(error);
                    return (<ScrollView style={styles.container}>
                        <Text style={styles.title}>Fill the details below</Text>
                        <View style={styles.formView}>
                            <Input
                                placeholder="Full Name"
                                shake={true}
                                value={this.state.fullName}
                                errorMessage={this.state.error.fullName}
                                onChangeText={(value) => {
                                    this.setState({fullName: value})
                                }}
                            />
                            <Input
                                placeholder="E-mail"
                                shake={true}
                                value={this.state.emailID}
                                errorMessage={this.state.error.emailID}
                                onChangeText={(value) => {
                                    this.setState({emailID: value})
                                }}
                            />
                            <Input
                                placeholder="Address"
                                shake={true}
                                value={this.state.address}
                                errorMessage={this.state.error.address}
                                onChangeText={(value) => {
                                    this.setState({address: value})
                                }}
                            />
                            <Input
                                placeholder="Social Media Profile(Github,Facebook)"
                                shake={true}
                                value={this.state.socialMedia}
                                errorMessage={this.state.error.socialMedia}
                                onChangeText={(value) => {
                                    this.setState({socialMedia: value})
                                }}
                            />
                            <Text style={{
                                textAlign: "center",
                                fontSize: 14,
                                color: "green",
                                marginVertical: 10,
                            }}>{this.state.submitStatus}</Text>
                            {(error) ? (<ErrorComponent error={cycleErrors(error.graphQLErrors)}/>) : null}

                            < Button
                                title="Submit"
                                titleStyle={{color: colors.TEXT_BLACK}}
                                buttonStyle={{
                                    backgroundColor: colors.SECONDARY
                                }}
                                onPress={async () => {
                                    let account = await this._validate();
                                    if (Object.keys(this.state.error).length === 0) {
                                        this.setState({submitStatus: "Creating a new user"});
                                        createAdminRecord({variables: account});
                                    } else {
                                        this.setState({submitStatus: "Validation Error"});
                                    }

                                }}
                            />

                        </View>

                    </ScrollView>)
                }}
            </Mutation>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.PRIMARY_DARK,
    },
    formView: {
        marginHorizontal: 10,
        marginVertical: 10,
        paddingVertical: 10,
        alignItems: "center",
        backgroundColor: colors.TEXT_WHITE,
    },
    title: {
        fontSize: 16,
        color: colors.TEXT_WHITE,
        textAlign: "center",
    },
});


export default CreateAdmin;
