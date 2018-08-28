import React, {Component} from 'react';
import {
    ScrollView,
    View,
    Text,
    Picker,
    StyleSheet,
    Modal,
    PermissionsAndroid,
    ToastAndroid,
    AsyncStorage,
    TouchableHighlight
} from 'react-native';
import {Input, Button, Icon} from 'react-native-elements'
import {colors, api} from "../config/init";
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';
import Reactotron from 'reactotron-react-native';
import imagePicker from 'react-native-image-picker';
import {Mutation} from "react-apollo";
import {createMemory} from "../graphql/mutations";
import validator from 'validator';
import {cycleErrors} from "../config/helpers";
import ErrorComponent from "../components/ErrorComponent";

const initialState = {
    memoryType: "none",
    erectedOn: null,
    erectedBy: null,
    calendar: false, //calendar visibility state
    calendarInitialDate: new Date(), // Initial start date in calendar
    picture: {}, // blob containing photo from photo
    pictureURL: null, // Cloudinary URL from server after photo upload
    pictureError: "Select a picture to upload", //Status of upload
    contributorName: "",
    contributorEmail: "",
    contributorNotes: "",
    error: {},
};

class CreateMemoryScreen extends Component {
    constructor(props) {
        super(props);
        this.state = initialState;
        this.state.personID = props.navigation.state.params.deceasedID;
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
        this.setState({erectedOn: "" + moment(date).format("YYYY-MM-DD")});
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
                    if (response.fileSize > 5000000) { // File size in kb
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
        if (this.state.memoryType === 'none') {
            this._setError({memoryType: "This is required"});
        }

        if (!validator.matches(this.state.contributorName, /^[A-Za-z'. ]{2,30}$/)) {
            this._setError({contributorName: "This should be a valid name"})
        }
        if (!validator.isEmail(this.state.contributorEmail)) {
            this._setError({contributorEmail: "This should be a valid email id"})
        }
        return {
            deceasedID: this.state.personID,
            memoryType: this.state.memoryType,
            memoryImageURL: url ? [url] : null,
            erectedOn: this.state.erectedOn,
            erectedBy: this.state.erectedBy ? this.state.erectedBy.split(",") : null,
            addedBy: this.state.contributorName + " - " + this.state.contributorEmail,
            editorNotes: this.state.contributorNotes ? this.state.contributorNotes : "Created a memory entry",
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
            <Mutation mutation={createMemory}
                      onError={() => {
                          this.setState({submitStatus: 'Server returned these errors'})
                      }}
                      onCompleted={(result) => {
                          if (result.createMemory !== null) {
                              this.setState(initialState);
                              this.setState({submitStatus: "Successfully created memory entry with id: " + result.createMemory.id});
                          } else {
                              this.setState({submitStatus: "Some validation error occurred on server-side.Please avoid special characters"})
                          }
                      }}
            >
                {(createMemoryRecord, {loading, error, data}) => {
                    return (<ScrollView style={styles.container}>
                        {/*Modal View for calendar to select dateOfBirth and dateOfDeath*/}
                        <Modal
                            animationType="slide"
                            transparent={true}
                            onRequestClose={() => {
                                this.setState({calendar: false})
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
                                        alignItems: 'center'
                                    }}>
                                        <TouchableHighlight
                                            underlayColor={colors.PRIMARY}
                                            onPress={() => {
                                                this.setState(
                                                    {
                                                        calendarInitialDate:
                                                            (moment(this.state.calendarInitialDate).subtract(1, 'y'))
                                                    });
                                            }}><Text style={{color: colors.TEXT_WHITE}}>{"<<<"}</Text>
                                        </TouchableHighlight>
                                        <TouchableHighlight
                                            underlayColor={colors.PRIMARY}
                                            onPress={() => {
                                                this.setState({
                                                    calendar: false,
                                                    calendarInitialDate: new Date()
                                                });
                                            }}
                                        ><Text style={{color: colors.TEXT_WHITE}}>Close Calendar</Text>
                                        </TouchableHighlight>
                                        <TouchableHighlight
                                            underlayColor={colors.PRIMARY}
                                            onPress={() => this._reset()}
                                        ><Text
                                            style={{color: colors.TEXT_WHITE}}>Reset Date</Text>
                                        </TouchableHighlight>
                                        <TouchableHighlight
                                            underlayColor={colors.PRIMARY}
                                            onPress={() => {
                                                this.setState(
                                                    {
                                                        calendarInitialDate:
                                                            (moment(this.state.calendarInitialDate).add(1, 'y'))
                                                    });
                                            }}>
                                            <Text style={{color: colors.TEXT_WHITE}}>{">>>"}</Text>
                                        </TouchableHighlight>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                        <Text style={styles.title}>Create Memory for Person with {this.state.personID}</Text>
                        <Picker
                            mode='dropdown'
                            selectedValue={this.state.memoryType}
                            style={styles.picker}
                            onValueChange={(itemValue, itemIndex) => this.setState({
                                memoryType: itemValue
                            })}
                        >
                            <Picker.Item label="Select the memory type" value="none"/>
                            <Picker.Item label="Tree" value="TREE"/>
                            <Picker.Item label="Bench" value="BENCH"/>
                            <Picker.Item label="Garden" value="GARDEN"/>
                            <Picker.Item label="Others" value="OTHER"/>
                        </Picker>
                        <View style={styles.formView}>
                            <Input
                                placeholder="Erected Date"
                                shake={true}
                                value={this.state.erectedOn}
                                onFocus={() => this.setState({calendar: true})}
                                errorMessage={this.state.error.erectedOn}
                            />
                            <Input
                                placeholder="Erected By (separate by comma if multiple)"
                                shake={true}
                                value={this.state.erectedBy}
                                errorMessage={this.state.error.erectedBy}
                                onChangeText={(value) => {
                                    this.setState({erectedBy: value})
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
                                    let memoryData = null;
                                    if (!this.state.pictureURL && this.state.picture.uri) {//Only one picture is uploaded,cannot change if submitted at least once
                                        memoryData = await this._uploadAndValidate();
                                    } else {
                                        memoryData = await this._validate();
                                    }
                                    if (Object.keys(this.state.error).length === 0) {
                                        this.setState({submitStatus: "Creating a new user"});
                                        createMemoryRecord({variables: memoryData});
                                    } else {
                                        this.setState({submitStatus: "Validation Error, check memoryType"});
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
    divider: {
        paddingVertical: 10,
    },
    title: {
        fontSize: 16,
        color: colors.TEXT_WHITE,
        textAlign: "center",
    },
    picker: {
        height: 50,
        marginVertical: 10,
        marginHorizontal: 10,
        backgroundColor: colors.TEXT_WHITE,
        borderRadius: 75
    },
});


export default CreateMemoryScreen;
