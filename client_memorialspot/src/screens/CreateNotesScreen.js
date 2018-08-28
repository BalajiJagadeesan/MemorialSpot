import React, {Component} from 'react';
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
} from 'react-native';
import {Input, Button, Icon} from 'react-native-elements'
import {colors, api} from "../config/init";
import Reactotron from 'reactotron-react-native';
import {Mutation} from "react-apollo";
import validator from 'validator';
import {createANote} from "../graphql/mutations";
import {cycleErrors} from "../config/helpers";
import ErrorComponent from "../components/ErrorComponent";

const initialState = {
    description: "",
    contributorName: "",
    contributorEmail: "",
    error: {},
};

class CreateNotesScreen extends Component {

    constructor(props) {
        super(props);
        this.state = initialState;
        this.state.personID = props.navigation.state.params.deceasedID;
    }

    _setError(value) {
        this.setState((prevState) => {
            return {error: Object.assign({}, prevState.error, value)};
        });
    }

    async _validate() {
        this.setState({error: {}, submitStatus: "Validating"});

        if (!validator.matches(this.state.contributorName, /^[A-Za-z'. ]{2,30}$/)) {
            this._setError({contributorName: "This should be a valid name"})
        }
        if (!validator.isEmail(this.state.contributorEmail)) {
            this._setError({contributorEmail: "This should be a valid email id"})
        }
        return {
            nameOfPerson: this.state.contributorName,
            emailID: this.state.contributorEmail,
            deceasedID: this.state.personID,
            note: this.state.description,
        }
    }


    render() {
        return (
            <Mutation mutation={createANote}
                      onError={() => {
                          this.setState({submitStatus: 'Server returned these errors'})
                      }}
                      onCompleted={(result) => {
                          if (result.createANote !== null) {
                              this.setState(initialState);
                              this.setState({submitStatus: "Successfully added entry with id: " + result.createANote.id});
                          } else {
                              this.setState({submitStatus: "Some validation error occurred on server-side.Please avoid special characters"})
                          }
                      }}
            >
                {(createNoteRecord, {loading, error, data}) => {
                    return (<ScrollView style={styles.container}>
                        <Text style={styles.title}>Testimonial for Person with id {this.state.personID}</Text>
                        <View style={styles.formView}>
                            <Input
                                placeholder="Write a testimonial"
                                shake={true}
                                value={this.state.description}
                                errorMessage={this.state.error.description}
                                onChangeText={(value) => {
                                    this.setState({description: value})
                                }}
                                inputStyle={{height: this.state.descriptionHeight}}
                                multiline={true}
                                onContentSizeChange={(e) => {
                                    this.setState({descriptionHeight: e.nativeEvent.contentSize.height})
                                }}
                            />
                            <Text>Contributor Details:</Text>
                            <Input
                                placeholder="Contributor fullName"
                                shake={true}
                                value={this.state.contributorName}
                                errorMessage={this.state.error.contributorName}
                                onChangeText={(value) => {
                                    this.setState({contributorName: value})
                                }}
                            />
                            <Input
                                placeholder="Contributor E-mail"
                                shake={true}
                                value={this.state.contributorEmail}
                                errorMessage={this.state.error.contributorEmail}
                                onChangeText={(value) => {
                                    this.setState({contributorEmail: value})
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
                                    let note = await this._validate();
                                    if (Object.keys(this.state.error).length === 0) {
                                        this.setState({submitStatus: "Creating a new user"});
                                        createNoteRecord({variables: note});
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


export default CreateNotesScreen;
