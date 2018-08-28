/**
 * To display memorial details of a person
 */
import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions, ScrollView, TouchableHighlight, Image} from 'react-native';
import {Card, Avatar, Icon} from 'react-native-elements';
// import Reactotron from 'reactotron-react-native';
import {colors} from "../config/init";
import {resolveImage, transformImage} from "./helperFunctions";
import Carousel from "react-native-snap-carousel";

const {width,height} = Dimensions.get('window');
class MemoryView extends Component {

    constructor(props) {
        super(props);
        // Reactotron.log(props);
    }

    _showDirection() {
        let obj = {
            id: this.props.data.id,
            location: {
                latitude: this.props.data.location.latitude,
                longitude: this.props.data.location.longitude,
            },
            memoryType: this.props.data.memoryType,
            firstName: this.props.navigation.state.params.firstName,
        };
        this.props.navigation.navigate('DirectionScreen', obj);
    }

    _editMemoryEntry() {
        let obj = {
            id: this.props.data.id,
            title: `${this.props.navigation.state.params.firstName} ${this.props.data.memoryType}`,
            type: "Memory",
        };
        this.props.navigation.navigate('EditEntry', obj)
    }


    _createLocation() {
        let obj = {
            id: this.props.data.id,
            title: `${this.props.navigation.state.params.firstName} ${this.props.data.memoryType}`
        };
        this.props.navigation.navigate('CreateLocation', obj)

    }

    renderItem = ({item}) => {
      return(<Image source={transformImage(item, 300)} style={styles.tile} />)
    };

    _imageCarousel() {
        if (this.props.data.memoryImageURL && this.props.data.memoryImageURL.length) {
            return (
                <View style={styles.scrollCarousel}>
                    <Carousel
                        data={this.props.data.memoryImageURL}
                        renderItem={this.renderItem}
                        itemWidth={width * 0.5}
                        sliderWidth={width}
                        containerCustomStyle={styles.carousel}
                        slideStyle={{flex: 1}}
                    />
                </View>
            );
        }
        else {
            return <View style={styles.scrollContainer}>
                <Avatar
                    overlayContainerStyle={{marginHorizontal: 10}}
                    xlarge
                    source={resolveImage(this.props.data.memoryType, 150)}
                    activeOpacity={0.7}
                />
            </View>
        }
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

    render() {
        let erectedOn = "Not available";
        if (this.props.data.erectedOn) {
            erectedOn = this.props.data.erectedOn
        }
        let erectedBy = "Not available";
        if (this.props.data.erectedBy && this.props.data.erectedBy.length > 0) {
            erectedBy = "";
            this.props.data.erectedBy.map((data) => {
                erectedBy += data;
            });
        }
        let verified = null;
        if (this.props.data.isVerified && this.props.data.isVerified === true) {
            verified = (<Icon
                raised
                name='check'
                type='font-awesome'
                size={15}
                color={colors.TEXT_WHITE}
                containerStyle={{backgroundColor: "green"}}
            />)
        }
        return (
            <View style={styles.container}>
                {this._imageCarousel()}
                <Card style={styles.card}>
                    <View style={styles.heading}>
                        <View>
                            <Text style={styles.text}>Erected on: {erectedOn}</Text>
                            <Text style={styles.text}>Erected by: {erectedBy}</Text>
                        </View>
                        {verified}
                    </View>
                    <View style={styles.footer}>
                        <TouchableHighlight underlayColor={colors.TEXT_WHITE}
                                            onPress={() => this._showPastEdits()}>
                            <Text style={{color: "blue", fontSize: 18}}>See Edit list</Text>
                        </TouchableHighlight>
                        <View style={styles.rightAlign}>
                            {(this.props.data.location) ?
                                <Icon
                                    raised
                                    name='map'
                                    type='font-awesome'
                                    size={20}
                                    onPress={() => this._showDirection()}
                                    color={colors.TEXT_BLACK}
                                    containerStyle={{backgroundColor: colors.SECONDARY}}
                                /> : <Icon
                                    raised
                                    name='plus'
                                    type='font-awesome'
                                    size={20}
                                    color={colors.TEXT_BLACK}
                                    onPress={() => this._createLocation()}
                                    containerStyle={{backgroundColor: colors.SECONDARY}}
                                />
                            }
                            <Icon
                                raised
                                name='edit'
                                type='font-awesome'
                                size={20}
                                color={colors.TEXT_BLACK}
                                onPress={() => this._editMemoryEntry()}
                                containerStyle={{backgroundColor: colors.SECONDARY}}
                            />
                        </View>
                    </View>
                </Card>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    text: {
        fontSize: 16,
    },
    container: {
        flex: 1,
        backgroundColor: colors.PRIMARY_DARK,
    },
    scrollContainer:{
        height: 200,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    scrollCarousel: {
        marginVertical:20,
        height:height/2.5,
    },
    carousel: {
        flex: 1,
    },
    tile: {
        flex: 1,
        width: width/2,
    },
    image: {
        width: width/2,
        height: height/2.5,
    },
    // carousel: {
    //     paddingHorizontal: 20,
    // },
    heading: {
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
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
        paddingTop: 10
    },
});

export default MemoryView;
