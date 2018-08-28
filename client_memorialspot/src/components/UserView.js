/**
 * Component to display deceased person profile along with memorial list
 */
import React, {Component} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableHighlight} from 'react-native';
import {Card, Icon, Avatar, Badge, Button} from 'react-native-elements';
import {colors, images} from "../config/init";
import {resolveImage, transformImage} from "./helperFunctions";

//Set layout based on person verified or not
let align = "center";

class UserView extends Component {
    constructor(props) {
        super(props);
    }

    _highlightSelected(id) {
        if (this.props.navigation.state.params.memoryID === id) {
            return (<Badge value={"selected"} containerStyle={{ backgroundColor: colors.PRIMARY}} wrapperStyle={{paddingRight: 20}} textStyle={{color: colors.SECONDARY}}/>)
        }
    }

    _showMemory(memory) {
        let obj = {
            firstName: this.props.data.firstName,
            memory: memory,
        };
        this.props.navigation.navigate('MemoryDetails', obj);
    }

    _createMemory() {
        let obj = {
            deceasedID: this.props.data.id,
            title : `${this.props.data.firstName}'s New Memory Entry`
        };
        this.props.navigation.navigate('CreateMemory', obj);
    }

    _showNotes() {
        let obj = {
            firstName: this.props.data.firstName,
            id: this.props.data.id,
            notes: this.props.data.personalNote,
        };
        this.props.navigation.navigate('Notes', obj);
    }

    _showPastEdits() {
        let obj = {
            createdAt: this.props.data.createdAt,
            updatedAt: this.props.data.updatedAt,
            editorNotes: this.props.data.editorNotes,
            addedBy: this.props.data.addedBy,
        };
        this.props.navigation.navigate('ShowEditHistory', obj);
    }

    _editPerson() {
        let obj = {
            id: this.props.data.id,
            title: this.props.data.firstName,
            type: "Person",
        };
        this.props.navigation.navigate('EditEntry', obj)
    }

    render() {
        let dateOfBirth = "N.A";
        let dateOfDeath = "N.A";
        let description = "Description not available";
        let address = "";
        let verified = null;
        if (this.props.data.dateOfBirth) {
            dateOfBirth = this.props.data.dateOfBirth;
        }
        if (this.props.data.dateOfDeath) {
            dateOfDeath = this.props.data.dateOfDeath;
        }
        if (this.props.data.description || this.props.data.description.length > 2) {
            description = this.props.data.description;
        }
        if (this.props.data.isVerified && this.props.data.isVerified === true) {
            align = 'space-between';
            verified = (<Icon
                raised
                name='check'
                type='font-awesome'
                size={15}
                color={colors.TEXT_WHITE}
                containerStyle={{backgroundColor: "green"}}
            />)
        }

        (this.props.data.address) ? address += this.props.data.address+"," : address += "";
        (this.props.data.city) ? address += this.props.data.city + "," : address += "";
        (this.props.data.state) ? address += this.props.data.state + "," : address += "";
        (this.props.data.country) ? address += this.props.data.country + "." : address += "";
        (address.length <= 0) ? address = "Not Specified" : address;

        let image = images.avatar;
        if (this.props.data.profilePic && this.props.data.profilePic.length > 20) {
            image = transformImage(this.props.data.profilePic, 150);
        }

        return (
            <ScrollView style={styles.container}>

                <Card style={styles.card}>
                    <View style={styles.heading}>
                        <View style={styles.title}>
                            <Text style={styles.text}> {this.props.data.firstName} {this.props.data.lastName} </Text>
                            <Text style={styles.text}> {dateOfBirth} to {dateOfDeath}</Text>
                        </View>
                        {verified}
                    </View>
                    <View style={{marginVertical: 10, justifyContent: 'center', alignItems: "center"}}>
                        <Avatar
                            xlarge
                            rounded
                            source={image}
                            activeOpacity={0.7}
                        />
                    </View>
                    <ScrollView style={styles.description}>
                        <Text style={[{textAlign: "center"}, styles.text]}>"{description}"</Text>
                    </ScrollView>
                    <View style={styles.address}>
                        <Text style={[{flex:0.5},styles.text]}>Address:</Text>
                        <Text style={[{flex:0.5},styles.text]} numberOfLines={2}>{address}</Text>
                    </View>
                    <View style={styles.footer}>
                        <TouchableHighlight underlayColor={colors.TEXT_WHITE} onPress={() => this._showPastEdits()}>
                            <Text style={{color: "blue", fontSize: 18}}>See Edit list</Text>
                        </TouchableHighlight>
                        <View style={styles.rightAlign}>
                            <Button
                                title="Testimonials"
                                titleStyle={{color:colors.TEXT_BLACK}}
                                buttonStyle={{
                                    backgroundColor:colors.SECONDARY
                                }}
                                onPress={() => {
                                    this._showNotes()
                                }}
                            >
                            </Button>
                            <Icon
                                raised
                                name='edit'
                                type='font-awesome'
                                size={20}
                                color={colors.TEXT_BLACK}
                                onPress={() => {
                                    this._editPerson();
                                }}
                                containerStyle={{backgroundColor: colors.SECONDARY}}
                            />
                        </View>
                    </View>
                </Card>
                <View style={styles.memoryTitle}>
                    <Text style={styles.memoryText}>Memories:</Text>
                    <Icon
                        raised
                        name='plus'
                        type='font-awesome'
                        size={20}
                        onPress={() => this._createMemory()}
                        color={colors.TEXT_BLACK}
                        containerStyle={{backgroundColor: colors.SECONDARY}}
                    />
                </View>
                {
                    this.props.data.memories.map((memory, index) => {
                        return (
                            <TouchableHighlight key={index} underlayColor={colors.PRIMARY}
                                                onPress={() => this._showMemory(memory)}
                            >
                                <View style={styles.listItem}>
                                    <View style={styles.listItemLeft}>
                                        <Avatar
                                            small
                                            rounded
                                            source={resolveImage(memory.memoryType)}
                                            activeOpacity={0.7}
                                        />
                                        <Text style={{
                                            fontSize: 16,
                                            textAlign: "center",
                                            paddingLeft: 10
                                        }}>{memory.memoryType}</Text>
                                    </View>
                                    <View style={styles.listItemRight}>
                                        {this._highlightSelected(memory.id)}
                                        <Icon
                                            name='chevron-right'
                                            type='font-awesome'
                                            size={20}
                                            color={colors.TEXT_BLACK}
                                        />
                                    </View>
                                </View></TouchableHighlight>)
                    })
                }
            </ScrollView>
        );
    }
}


const styles = StyleSheet.create({
    text: {
        fontSize: 16,
        color: colors.TEXT_BLACK
    },
    container: {
        flex: 1,
        backgroundColor: colors.PRIMARY_DARK,
    },
    card: {
        flex: 0.4,
    },
    heading: {
        alignItems: "center",
        justifyContent: align,
        flexDirection: "row",
    },
    title: {
        padding: 10,
        elevation: 2,
        backgroundColor: colors.SECONDARY,
        shadowColor: "#000",
        shadowRadius: 5,
        shadowOpacity: 0.3,
        shadowOffset: {x: 2, y: -2},
        height: 50,
        width: 200,
        borderRadius: 25,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
    },
    description: {
        marginVertical: 10,
        height: 100,
    },
    address: {
        flex:1,
        marginVertical: 10,
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: "center"
    },
    rightAlign: {
        justifyContent: "flex-end",
        flexDirection: "row",
        alignItems: "center",
    },
    footer: {
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "center",
    },
    memoryTitle: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 15,
        justifyContent: "space-between"
    },
    memoryText: {
        color: colors.TEXT_WHITE,
        fontSize: 20,
    },
    listItem: {
        flexDirection: "row",
        alignContent: "center",
        justifyContent: "space-between",
        marginHorizontal: 15,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        backgroundColor: colors.TEXT_WHITE
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

export default UserView;
