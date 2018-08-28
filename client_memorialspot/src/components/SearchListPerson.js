/**
 * Component to display the search result
 */
import React, {Component} from 'react';
import {View, Text, TouchableHighlight, StyleSheet} from 'react-native';
import {colors} from "../config/init";
import {transformImage} from "./helperFunctions";
import {Icon, Avatar} from 'react-native-elements';

class SearchListPerson extends Component {
    constructor(props) {
        super(props);
    }

    _showUser() {
        let obj = {
            id: this.props.data.id,
            firstName: this.props.data.firstName,
            lastName: this.props.data.lastName,
            memoryID: this.props.data.memoryID ? this.props.data.memoryID : "",
        };
        this.props.navigation.navigate('UserDetails', obj);
    }

    render() {
        let dateOfBirth = "N.A";
        let dateOfDeath = "N.A";
        let image = require("../assets/icons/avatar.png");
        if (this.props.data.image && this.props.data.image.length > 0) {
            image = transformImage(this.props.data.image, 150)
        }
        if (this.props.data.dateOfBirth) {
            dateOfBirth = this.props.data.dateOfBirth;
        }
        if (this.props.data.dateOfDeath) {
            dateOfDeath = this.props.data.dateOfDeath;
        }
        return (<TouchableHighlight onPress={() => this._showUser()}>
                <View style={styles.listItem}>
                    <View style={styles.listItemLeft}>
                        <Avatar
                            medium
                            rounded
                            source={image}
                            activeOpacity={0.7}
                        />
                        <View style={styles.textCenter}>
                            <Text style={styles.content}>{this.props.data.firstName} {this.props.data.lastName}</Text>
                            <Text style={styles.content}>{dateOfBirth} to {dateOfDeath}</Text>
                        </View>
                    </View>
                    <View style={styles.listItemRight}>
                        <Icon
                            name='chevron-right'
                            type='font-awesome'
                            size={20}
                            color={colors.TEXT_BLACK}
                        />
                    </View>
                </View></TouchableHighlight>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.TEXT_WHITE,
        height: 75,
        flexDirection: "row",
    },
    textCenter: {
        paddingLeft: 20,
    },
    content: {
        fontSize: 18,
    },
    listItem: {
        flexDirection: "row",
        alignContent: "center",
        justifyContent: "space-between",
        backgroundColor: colors.TEXT_WHITE,
        paddingHorizontal: 10,
        paddingVertical: 10
    },
    listItemLeft: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    listItemRight: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
    }
});

export default SearchListPerson;
