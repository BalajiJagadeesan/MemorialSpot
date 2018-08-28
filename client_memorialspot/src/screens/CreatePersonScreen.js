import React, {Component} from 'react';
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    Modal,
    PermissionsAndroid,
    AsyncStorage,
    TouchableHighlight,
    ToastAndroid
} from 'react-native';
import {Input, Button, Icon} from 'react-native-elements'
import {colors, api} from "../config/init";
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';
import Reactotron from 'reactotron-react-native';
import imagePicker from 'react-native-image-picker';
import {Mutation} from "react-apollo";
import {createDeceasedPerson} from "../graphql/mutations";
import validator from 'validator';
import ErrorComponent from "../components/ErrorComponent";
import {cycleErrors} from "../config/helpers";

const initialState = {
    firstName: "",
    lastName: "",
    dateOfBirth: null,
    dateOfDeath: null,
    calendar: false, //calendar visibility state
    variable: "", // whether calendar represents dateOfBirth or dateOfDeath
    calendarInitialDate: new Date(), // Initial start date in calendar
    address: null,
    city: null,
    state: null,
    country: null,
    zipcode: null,
    description: null,
    descriptionHeight: 50, // How much height to add when enter is pressed inside text highlight
    picture: {}, // blob containing photo from photo
    pictureURL: null, // Cloudinary URL from server after photo upload
    pictureError: "Select a picture to upload", //Status of upload
    contributorName: "",
    contributorEmail: "",
    contributorNotes: "",
    error: {},
};

class CreatePersonScreen extends Component {
    constructor(props) {
        super(props);
        Reactotron.log(props);
        this.state = initialState;
        this.state.submitStatus = "";
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

    _selectDate(date) {
        if (this.state.variable === 'dateOfBirth') {
            this.setState({dateOfBirth: "" + moment(date).format("YYYY-MM-DD")});
        }
        if (this.state.variable === 'dateOfDeath') {
            this.setState({dateOfDeath: "" + moment(date).format("YYYY-MM-DD")});
        }
    }

    _reset() {
        if (this.state.variable === 'dateOfBirth') {
            this.setState({dateOfBirth: null});
            ToastAndroid.show('Date of Birth is reset', ToastAndroid.SHORT);
        }
        if (this.state.variable === 'dateOfDeath') {
            this.setState({dateOfDeath: null});
            ToastAndroid.show('Date of Death is reset', ToastAndroid.SHORT);
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
        if (!validator.matches(this.state.firstName, /^[A-Za-z'. ]{2,15}$/)) {
            this._setError({firstName: "This should not be empty and contain special characters"})
        }
        if (!validator.matches(this.state.lastName, /^[A-Za-z'. ]{2,15}$/)) {
            this._setError({lastName: "This should not be empty and contain special characters"})
        }

        if (this.state.address && !validator.matches(this.state.address, /^[0-9A-Za-z,/ ]+$/)) {
            this._setError({address: "This should not contain any special characters"})
        }
        if (this.state.city && !validator.matches(this.state.city, /^[A-Za-z ]+$/)) {
            this._setError({city: "This should not contain any special characters and numbers"})
        }
        if (this.state.state && !validator.matches(this.state.state, /^[A-Z]{2}$/)) {
            this._setError({state: "This should be abbreviated"})
        }
        if (this.state.zipcode && !validator.isPostalCode(this.state.zipcode, 'any')) {
            this._setError({zipcode: "This should be a valid zipcode"})
        }
        if (!validator.matches(this.state.contributorName, /^[A-Za-z'. ]{2,30}$/)) {
            this._setError({contributorName: "This should be a valid name"})
        }
        if (!validator.isEmail(this.state.contributorEmail)) {
            this._setError({contributorEmail: "This should be a valid email id"})
        }

        return {
            firstName: this.state.firstName ? this.state.firstName : "",
            lastName: this.state.lastName ? this.state.lastName : "",
            profilePic: url ? url : this.state.pictureURL,
            dateOfBirth: this.state.dateOfBirth ? this.state.dateOfBirth : null,
            dateOfDeath: this.state.dateOfDeath ? this.state.dateOfDeath : null,
            address: this.state.address ? this.state.address : null,
            city: this.state.city ? this.state.city : null,
            state: this.state.state ? this.state.state : null,
            country: this.state.country ? this.state.country : null,
            zipcode: this.state.zipcode ? this.state.zipcode : null,
            description: this.state.description ? this.state.description : null,
            addedBy: this.state.contributorName + " - " + this.state.contributorEmail,
            editorNotes: this.state.contributorNotes ? this.state.contributorNotes : "Created a person entry",
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
        this.setState({pictureURL: image.data.url, submitStatus: "Upload Completed"});
        return this._validate(image.data.url)
    }

    render() {
        return (
            <Mutation mutation={createDeceasedPerson}
                      onError={() => {
                          this.setState({submitStatus: 'Server returned these errors'})
                      }}
                      onCompleted={(result) => {
                          if (result.createDeceasedPerson !== null) {
                              this.setState(initialState);
                              this.setState({submitStatus: "Successfully created person with id: " + result.createDeceasedPerson.id});
                          } else {
                              this.setState({submitStatus: "Some validation error occurred on server-side.Please avoid special characters"})
                          }
                      }}
            >
                {(createPersonRecord, {loading, error, data}) => {
                    return (<ScrollView style={styles.container}>
                        {/*Modal View for calendar to select dateOfBirth and dateOfDeath*/}
                        <Modal
                            animationType="slide"
                            transparent={true}
                            onRequestClose={() => {
                                this.setState({calendar: false, variable: ""})
                            }}
                            visible={this.state.calendar}
                        >
                            <View style={{
                                flex: 1,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <View style={{
                                    backgroundColor: colors.PRIMARY_DARK,
                                    paddingHorizontal: 10,
                                    paddingVertical: 10,
                                    marginVertical: 10,
                                    marginHorizontal: 10,
                                }}>
                                    <CalendarPicker
                                        initialDate={this.state.calendarInitialDate}
                                        textStyle={{color: colors.TEXT_WHITE}}
                                        selectedDayColor={colors.SECONDARY}
                                        selectedDayTextColor={colors.TEXT_WHITE}
                                        todayBackgroundColor={colors.PRIMARY}
                                        onDateChange={(value) => this._selectDate(value)}
                                    />
                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-around',
                                        alignItems: 'center',
                                        marginVertical: 20,
                                    }}>
                                        <TouchableHighlight
                                            underlayColor={colors.PRIMARY}
                                            onPress={() => {
                                                this.setState(
                                                    {
                                                        calendarInitialDate:
                                                            (moment(this.state.calendarInitialDate).subtract(1, 'y'))
                                                    });
                                            }}><Text
                                            style={{color: colors.TEXT_WHITE}}>{"<<<"}</Text></TouchableHighlight>
                                        <TouchableHighlight
                                            underlayColor={colors.PRIMARY}
                                            onPress={() => {
                                                this.setState({
                                                    calendar: false,
                                                    variable: "",
                                                    calendarInitialDate: new Date()
                                                });
                                            }}
                                        >
                                            <Text style={{color: colors.TEXT_WHITE}}>Close Calendar</Text>
                                        </TouchableHighlight>
                                        <TouchableHighlight underlayColor={colors.PRIMARY}
                                            onPress={() => this._reset()}
                                        ><Text style={{color: colors.TEXT_WHITE}}>Reset Date</Text></TouchableHighlight>
                                        <TouchableHighlight
                                            underlayColor={colors.PRIMARY}
                                            onPress={() => {
                                                this.setState(
                                                    {
                                                        calendarInitialDate:
                                                            (moment(this.state.calendarInitialDate).add(1, 'y'))
                                                    });
                                            }}
                                        ><Text
                                            style={{color: colors.TEXT_WHITE}}>{">>>"}</Text></TouchableHighlight>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                        <View style={styles.formView}>

                            <Input
                                placeholder="First Name"
                                shake={true}
                                value={this.state.firstName}
                                errorMessage={this.state.error.firstName}
                                onChangeText={(value) => {
                                    this.setState({firstName: value})
                                }}
                            />
                            <Input
                                placeholder="Last Name"
                                shake={true}
                                value={this.state.lastName}
                                errorMessage={this.state.error.lastName}
                                onChangeText={(value) => {
                                    this.setState({lastName: value})
                                }}
                            />
                            <Input
                                placeholder="Date of Birth"
                                shake={true}
                                value={this.state.dateOfBirth}
                                onFocus={() => this.setState({calendar: true, variable: 'dateOfBirth'})}
                                errorMessage={this.state.error.dateOfBirth}
                            />
                            <Input
                                placeholder="Date of Death"
                                shake={true}
                                value={this.state.dateOfDeath}
                                onFocus={() => this.setState({calendar: true, variable: 'dateOfDeath'})}
                                errorMessage={this.state.error.dateOfDeath}
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
                                placeholder="City"
                                shake={true}
                                value={this.state.city}
                                errorMessage={this.state.error.city}
                                onChangeText={(value) => {
                                    this.setState({city: value})
                                }}
                            />
                            <Input
                                placeholder="State"
                                shake={true}
                                value={this.state.state}
                                errorMessage={this.state.error.state}
                                onChangeText={(value) => {
                                    this.setState({state: value})
                                }}
                            />
                            <Input
                                placeholder="Country"
                                shake={true}
                                value={this.state.country}
                                errorMessage={this.state.error.country}
                                onChangeText={(value) => {
                                    this.setState({country: value})
                                }}
                            />
                            <Input
                                placeholder="Zipcode"
                                shake={true}
                                value={this.state.zipcode}
                                errorMessage={this.state.error.zipcode}
                                onChangeText={(value) => {
                                    this.setState({zipcode: value})
                                }}
                            />
                            <Input
                                placeholder="Description"
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
                            <View style={{flexDirection: "row", justifyContent: 'flex-start', alignItems: "center"}}>
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
                            </View>
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
                                    let personData = null;
                                    if (!this.state.pictureURL && this.state.picture.uri) {//Only one picture is uploaded,cannot change if submitted at least once
                                        personData = await this._uploadAndValidate();
                                    } else {
                                        personData = await this._validate();
                                    }
                                    if (Object.keys(this.state.error).length === 0) {
                                        this.setState({submitStatus: "Creating a new user"});
                                        createPersonRecord({variables: personData});
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
    };
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
    divider: {
        paddingVertical: 10,
    }
});

export default CreatePersonScreen;
