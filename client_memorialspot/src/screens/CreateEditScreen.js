import React, {Component} from 'react';
import {ScrollView, View, Text, StyleSheet, Picker, PermissionsAndroid, AsyncStorage} from 'react-native';
import {Input, Button, Icon} from 'react-native-elements'
import {colors, api} from "../config/init";
import MapView, {Marker} from 'react-native-maps';
import Reactotron from 'reactotron-react-native';
import imagePicker from 'react-native-image-picker';
import {Mutation} from "react-apollo";
import {createEditsEntry} from "../graphql/mutations";
import validator from 'validator';
import {cycleErrors} from "../config/helpers";
import ErrorComponent from "../components/ErrorComponent";

const initialState = {
    isMapReady: false,
    choice: "keys", // Image upload or key-value pair option
    fieldName: "", // key to be modified
    fieldValue: "", // change key value to this
    picture: {}, // blob containing photo from photo
    pictureURL: null, // Cloudinary URL from server after photo upload
    pictureError: "Select a picture to upload", //Status of upload
    contributorName: "",
    contributorEmail: "",
    contributorNotes: "",
    error: {},
    region: {
        latitude: 43.131545,
        longitude: -77.601942,
        latitudeDelta: 0.0002,
        longitudeDelta: 0.0005
    }
};


class CreateEditScreen extends Component {
    constructor(props) {
        super(props);
        Reactotron.log(props);
        this.state = initialState;
        this.state.submitStatus = "";
        this.state.id = props.navigation.state.params.id;
        this.state.type = props.navigation.state.params.type;
    }

    async _requestCameraPermission() {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    'title': 'Permission to access Gallery',
                    'message': 'This is needed to selected image'
                }
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert(
                    'Can\'t upload photo',
                    'You need camera permission to select a picture from library',
                    [
                        {text: 'OK', onPress: () => console.log('OK Pressed')},
                    ],
                    {cancelable: true}
                );
                return false;
            }
            return true;
        } catch (err) {
            Reactotron.log(err);
        }
    }

    _pickImage() {
        const permission = async () => await this._requestCameraPermission();
        if (permission) {
            imagePicker.showImagePicker((response) => {
                if (response.didCancel) {
                    this.setState({
                        picture: {}
                    });
                }
                else if (response.error) {
                    this.setState({pictureError: response.error});
                } else {
                    if (response.fileSize > 5000000) {
                        this.setState({
                            pictureError: "File size cannot be greater than 5MB"
                        })
                    }
                    this.setState({
                        picture: response
                    });
                }
            });
        }
    }

    _setError(value) {
        this.setState((prevState) => {
            return {error: Object.assign({}, prevState.error, value)};
        });
    }

    async _validate(url) {
        this.setState({error: {}, submitStatus: "Validating"});

        if (this.state.fieldName.length < 2) {
            this._setError({fieldName: "This should not be null"})
        }
        if (this.state.fieldValue.length < 2) {
            this._setError({fieldValue: "This should not be null"})
        }
        if (!validator.matches(this.state.contributorName, /^[A-Za-z'. ]{2,30}$/)) {
            this._setError({contributorName: "This should be a valid name"})
        }
        if (!validator.isEmail(this.state.contributorEmail)) {
            this._setError({contributorEmail: "This should be a valid email id"})
        }
        if (this.state.contributorNotes.length < 5) {
            this._setError({contributorNotes: "Please justify edit"})
        }
        let type = "";

        if (this.state.type === "Person") {
            type = "DECEASED_PERSON";
            if (this.state.choice === "image") {
                type = "DECEASED_PERSON_IMAGE"
            }
        } else if (this.state.type === "Memory") {
            type = "MEMORY";
            if (this.state.choice === "image") {
                type = "MEMORY_IMAGE";
            }
        } else {
            type = "LOCATION"
        }

        return {
            nameOfEntry: type,
            correspondingID: this.state.id,
            entryField: url ? "Image" : this.state.fieldName,
            entryFieldValue: url ? url : this.state.fieldValue,
            editorName: this.state.contributorName,
            emailID: this.state.contributorEmail,
            description: this.state.contributorNotes,
        }
    }

    async _uploadAndValidate() {
        this.setState({submitStatus: "Found image,Uploading..."});
        const imageContent = new FormData();
        imageContent.append('image', {
            uri: this.state.picture.uri,
            type: this.state.picture.type ? this.state.picture.type : 'image/jpeg',
            name: 'testphoto'
        });
        let response = await fetch(api.IMAGE_URL, {
            method: 'post',
            headers: new Headers({
                'Authorization': 'Bearer ' + await AsyncStorage.getItem("ACCESS_TOKEN"),
            }),
            body: imageContent,
        });
        let image = await response.json();
        this.setState({
            pictureURL: image.data.url,
            submitStatus: "Upload Completed",
            fieldName: "Image",
            fieldValue: image.data.url
        });
        return this._validate(image.data.url)
    }

    onMapLayout = () => {
        this.setState({isMapReady: true});
    };

    render() {
        return (
            <Mutation mutation={createEditsEntry}
                      onError={() => {
                          this.setState({submitStatus: 'Server returned these errors'})
                      }}
                      onCompleted={(result) => {
                          Reactotron.log(result);
                          if (result.createEdits !== null) {
                              this.setState(initialState);
                              this.setState({submitStatus: "Successfully added entry with id: " + result.createEdits.id});
                          } else {
                              this.setState({submitStatus: "Some validation error occurred on server-side.Please avoid special characters"})
                          }
                      }}
            >
                {(createEditRecord, {loading, error, data}) => {
                    (error) ? Reactotron.log(error) : null;
                    (data) ? Reactotron.log(data) : null;
                    return (<ScrollView style={styles.container}>
                        {(this.state.type !== "Location")
                            ? (<Text style={styles.title}>Choose what you want to do</Text>)
                            : (<Text style={styles.title}>Drop the pin on the map</Text>)
                        }
                        {(this.state.type === 'Location')
                            ? <MapView
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
                                            Reactotron.log(e.nativeEvent.coordinate);
                                            this.setState({
                                                fieldName: "Location",
                                                fieldValue: `${JSON.stringify(e.nativeEvent.coordinate)}`
                                            })
                                        }}
                                />
                                }
                            </MapView> : null
                        }
                        {(this.state.type === "Person" || this.state.type === "Memory") ? (
                            <Picker
                                mode='dropdown'
                                selectedValue={this.state.choice}
                                style={styles.picker}
                                onValueChange={(itemValue) => {
                                    this.setState(initialState);
                                    this.setState({choice: itemValue})
                                }}
                            >
                                <Picker.Item label="Edit values" value="keys"/>
                                <Picker.Item label="Image upload" value="image"/>
                            </Picker>) : null}
                        <View style={styles.formView}>

                            {(this.state.choice === "image")
                                ? <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: 'flex-start',
                                        alignItems: "center"
                                    }}>
                                    <Icon
                                        raised
                                        name='camera'
                                        type='font-awesome'
                                        size={20}
                                        onPress={() => this._pickImage()}
                                        color={colors.TEXT_BLACK}
                                    />
                                    {this.state.picture.uri
                                        ? <Text>{this.state.picture.uri}</Text>
                                        : <Text style={{textAlign: "center"}}>{this.state.pictureError}</Text>
                                    }
                                </View> : null
                            }
                            {(this.state.choice === "keys")
                                ? [<Input key="0"
                                          placeholder="Field to be changed"
                                          shake={true}
                                          value={this.state.fieldName}
                                          errorMessage={this.state.error.fieldName}
                                          onChangeText={(value) => {
                                              this.setState({fieldName: value})
                                          }}
                                />, <Input key="1"
                                           placeholder="Field Value"
                                           shake={true}
                                           value={this.state.fieldValue}
                                           errorMessage={this.state.error.fieldValue}
                                           onChangeText={(value) => {
                                               this.setState({fieldValue: value})
                                           }}
                                />] : null
                            }
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
                                    let editJSON = null;
                                    if (this.state.choice === 'image' && !this.state.pictureURL) {
                                        if (this.state.picture.uri) {
                                            editJSON = await this._uploadAndValidate();
                                        }
                                    }
                                    editJSON = await this._validate();
                                    if (Object.keys(this.state.error).length === 0) {
                                        this.setState({submitStatus: "Creating a new edit"});
                                        createEditRecord({variables: editJSON})
                                    } else if (this.state.choice === 'image') {
                                        this.setState({submitStatus: "Need image to upload"});
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
        backgroundColor: colors.TEXT_WHITE,
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

export default CreateEditScreen;
