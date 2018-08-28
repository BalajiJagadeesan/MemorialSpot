/**
 * To list memorials as a scrollable view on the Google Map screen
 */
import React, {Component} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {colors} from "../config/init";
import Reactotron from 'reactotron-react-native';
import {Avatar, Icon, Text} from "react-native-elements";
import {resolveImage, transformImage} from "./helperFunctions";

const {width, height} = Dimensions.get("window");
const CARD_HEIGHT = height / 3;
const CARD_WIDTH = CARD_HEIGHT - 25;


class ScrollCard extends Component {
    constructor(props) {
        super(props);
        Reactotron.log(props);
    }

    _displayUser() {
        let obj = {
            id: this.props.data.memory.deceasedPerson.id,
            firstName: this.props.data.memory.deceasedPerson.firstName,
            lastName: this.props.data.memory.deceasedPerson.lastName,
            memoryID: this.props.data.memory.id,
        };
        Reactotron.log(obj);
        this.props.navigation.navigate('UserDetails', obj);
    }

    _showDirection() {
        let obj = {
            id: this.props.data.id,
            location: {
                latitude: this.props.data.latitude,
                longitude: this.props.data.longitude,
            },
            memoryType: this.props.data.memory.memoryType,
            firstName: this.props.data.memory.deceasedPerson.firstName,
            lastName: this.props.data.memory.deceasedPerson.lastName,
        };
        this.props.navigation.navigate('DirectionScreen', obj);
    }

    render() {
        const memory = this.props.data.memory;
        let image = null;
        if (memory.memoryImageURL && memory.memoryImageURL.length > 0) {
            image = transformImage(memory.memoryImageURL[0], 150);
        } else {
            image = resolveImage(memory.memoryType)
        }

        let dateOfBirth = "N.A";
        if (memory.deceasedPerson.dateOfBirth) {
            dateOfBirth = memory.deceasedPerson.dateOfBirth;
        }
        let dateOfDeath = "N.A";
        if (memory.deceasedPerson.dateOfDeath) {
            dateOfDeath = memory.deceasedPerson.dateOfDeath;
        }

        return (
            <View style={styles.card} key={this.props.index}>
                <View style={styles.textContainer}>
                    <Avatar
                        large
                        rounded
                        source={image}
                        // activeOpacity={0.7}
                    />
                    <Text h4 style={styles.name}>
                        {memory.deceasedPerson.firstName} {memory.deceasedPerson.lastName}
                    </Text>
                    <Text>{dateOfBirth} to {dateOfDeath}</Text>
                </View>
                <View style={styles.iconGroup}>
                    {(this.props.data.latitude) ?
                        <Icon
                            raised
                            name='map'
                            type='font-awesome'
                            size={20}
                            onPress={() => this._showDirection()}
                            color='#f50'
                        /> : null
                    }
                    <Icon
                        raised
                        name='arrow-right'
                        type='font-awesome'
                        size={20}
                        onPress={() => this._displayUser()}
                        color={colors.PRIMARY}
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    name: {
        fontSize: 20,
        textAlign: "center",
    },
    card: {
        padding: 10,
        elevation: 2,
        backgroundColor: colors.SECONDARY,
        marginHorizontal: 10,
        shadowColor: "#000",
        shadowRadius: 5,
        shadowOpacity: 0.3,
        shadowOffset: {x: 2, y: -2},
        height: CARD_HEIGHT,
        width: CARD_WIDTH,
        overflow: "hidden",
    },
    textContainer: {
        flex: 0.75,
        alignItems: "center",
    },
    iconGroup: {
        flex: 0.25,
        alignItems: "flex-end",
        justifyContent: "flex-end",
        flexDirection: "row"
    }
});


export default ScrollCard;
