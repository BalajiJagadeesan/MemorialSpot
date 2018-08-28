import React, {Component} from 'react';
import {ScrollView, View, Text, StyleSheet} from 'react-native';
import {Input, Button, Icon} from 'react-native-elements'
import {colors} from "../config/init";
// import Reactotron from 'reactotron-react-native';
import {Mutation} from "react-apollo";
import {createLocation} from "../graphql/mutations";
import validator from 'validator';
import MapView, {Marker} from "react-native-maps";
import {cycleErrors} from "../config/helpers";
import ErrorComponent from "../components/ErrorComponent";

const initialState = {
    isMapReady: false,
    contributorName: "",
    contributorEmail: "",
    contributorNotes: "",
    error: {},
    latitude: null,
    longitude: null,
    region: {
        latitude: 43.131545,
        longitude: -77.601942,
        latitudeDelta: 0.0002,
        longitudeDelta: 0.0005
    }
};


class CreateLocationScreen extends Component {
    constructor(props) {
        super(props);
        // Reactotron.log(props);
        this.state = initialState;
        this.state.submitStatus = "";
        this.state.memoryID = props.navigation.state.params.id;

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

        if (this.state.latitude === null) {
            this._setError({coordinate: "Please set coordinates by dragging pin"})
        }

        return {
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            memoryID: this.state.memoryID,
            addedBy: this.state.contributorName + " - " + this.state.contributorEmail,
            editorNotes: this.state.contributorNotes ? this.state.contributorNotes : "Created a location entry",
        }
    }

    onMapLayout = () => {
        this.setState({isMapReady: true});
    };

    render() {
        return (
            <Mutation mutation={createLocation}
                      onError={() => {
                          this.setState({submitStatus: 'Server returned these errors'})
                      }}
                      onCompleted={(result) => {
                          // Reactotron.log(result);
                          if (result.createLocation !== null) {
                              this.setState(initialState);
                              this.setState({submitStatus: "Successfully created location entry with id: " + result.createLocation.id});
                          } else {
                              this.setState({submitStatus: "Some validation error occurred on server-side.Please avoid special characters"})
                          }
                      }}
            >
                {(createLocationRecord, {loading, error, data}) => {
                    return (<ScrollView style={styles.container}>
                        <Text style={styles.title}>Drop the pin on the map</Text>
                        <MapView
                            style={{height: 400, marginHorizontal: 10}}
                            initialRegion={this.state.region}
                            onLayout={this.onMapLayout}
                        >
                            {this.state.isMapReady &&
                            <Marker draggable
                                    coordinate={{
                                        latitude: this.state.region.latitude,
                                        longitude: this.state.region.longitude
                                    }}
                                    onDragEnd={(e) => {
                                        // Reactotron.log(e.nativeEvent.coordinate);
                                        this.setState({
                                            latitude: e.nativeEvent.coordinate.latitude,
                                            longitude: e.nativeEvent.coordinate.longitude
                                        })
                                    }}
                            />
                            }
                        </MapView>
                        <View style={styles.formView}>
                            {(this.state.error.coordinate) ?
                                <Text style={{fontSize: 16,color:"red"}}>{this.state.error.coordinate}</Text> : null}
                            <Text style={{fontSize: 16}}>Latitude:{this.state.latitude}</Text>
                            <Text style={{fontSize: 16}}>Longitude:{this.state.longitude}</Text>
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
                            <Input
                                placeholder="Note for contribution"
                                shake={true}
                                value={this.state.contributorNotes}
                                errorMessage={this.state.error.contributorNotes}
                                onChangeText={(value) => {
                                    this.setState({contributorNotes: value})
                                }}
                            />
                            <Text
                                style={{
                                    textAlign: "center",
                                    fontSize: 14,
                                    color: "green",
                                    marginVertical:10,
                                }}>{this.state.submitStatus}</Text>
                            {(error) ? (<ErrorComponent error={cycleErrors(error.graphQLErrors)}/>) : null}

                            < Button
                                title="Submit"
                                titleStyle={{color:colors.TEXT_BLACK}}
                                buttonStyle={{
                                    backgroundColor:colors.SECONDARY
                                }}
                                onPress={async () => {
                                    let locationJSON = null;
                                    locationJSON = await this._validate();
                                    if (Object.keys(this.state.error).length === 0) {
                                        this.setState({submitStatus: "Creating a new location entry"});
                                        createLocationRecord({variables: locationJSON});
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
    picker: {
        height: 50,
        marginVertical: 10,
        marginHorizontal: 10,
        backgroundColor: "orange",
        borderRadius: 75
    },
    divider: {
        paddingVertical: 10,
    },
    title: {
        marginVertical: 10,
        marginHorizontal: 10,
        color: colors.TEXT_WHITE,
        fontSize: 20,
    },
});


export default CreateLocationScreen;
