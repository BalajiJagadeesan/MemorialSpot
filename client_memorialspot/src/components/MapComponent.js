/**
 * Map View component to display Google map with scroll view of memorials
 */
import React, {Component} from 'react';
import {View, Dimensions, StyleSheet, Animated} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
// import Reactotron from 'reactotron-react-native';
import {Query} from "react-apollo";
import {getNearByLocations} from "../graphql/queries";
import {colors} from "../config/init";
import ScrollCard from "./ScrollCard";
import {resolveImage} from "./helperFunctions";
import {cycleErrors} from "../config/helpers";
import ErrorComponent from "./ErrorComponent";

const {width, height} = Dimensions.get("window");

const CARD_HEIGHT = height / 3;
const CARD_WIDTH = CARD_HEIGHT - 25;

class MapComponent extends Component {
    constructor(props) {
        super(props);
        this.index = 0;
        this.animation = new Animated.Value(0);
        this.animation.removeAllListeners();
        // Reactotron.log(props);
    }

    moveToLocation(location) {
        this.animation.addListener(({value}) => {
            let index = Math.floor(value / CARD_WIDTH + 0.3); // animate 30% away from landing on the next item
            if (index >= location.length) {
                index = location.length - 1;
            }
            if (index <= 0) {
                index = 0;
            }

            clearTimeout(this.regionTimeout);
            this.regionTimeout = setTimeout(() => {
                if (this.index !== index) {
                    this.index = index;
                    this.mapObject.animateToRegion(
                        {
                            latitude: parseFloat(location[index].latitude),
                            longitude: parseFloat(location[index].longitude),
                            latitudeDelta: this.props.initialRegion.latitudeDelta,
                            longitudeDelta: this.props.initialRegion.longitudeDelta,
                        },
                        350
                    );
                }
            }, 10);
        });
    }

    render() {
        return (
            <Query query={getNearByLocations}
                   variables={
                       {
                           // lat: this.props.initialRegion.latitude,
                           // long: this.props.initialRegion.longitude
                           lat: "43.131545",
                           long: " -77.601942"
                       }
                   }
            >{({loading, error, data: {getNearByLocation}}) => {
                if (loading) return (<MapView initialRegion={this.props.initialRegion}/>);
                this.moveToLocation(getNearByLocation);
                return (<View style={styles.container}>
                    <MapView style={styles.container}
                             ref={mapObject => this.mapObject = mapObject}
                             initialRegion={this.props.initialRegion}
                    >
                        {(error) ? (<ErrorComponent error={cycleErrors(error.graphQLErrors)}/>) : null}
                        <Marker
                            coordinate={{
                                latitude: this.props.latitude,
                                longitude: this.props.longitude
                            }}/>
                        {
                            getNearByLocation.map((location, index) => {
                                let value = resolveImage(location.memory.memoryType);
                                return (
                                    <Marker key={index} coordinate={
                                        {
                                            latitude: parseFloat(location.latitude),
                                            longitude: parseFloat(location.longitude)
                                        }
                                    } image={value} description={
                                        location.memory.deceasedPerson.firstName + "," + location.memory.deceasedPerson.lastName
                                    }
                                    >
                                    </Marker>
                                )
                            })
                        }
                    </MapView>
                    <Animated.ScrollView
                        horizontal
                        scrollEventThrottle={1}
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={CARD_WIDTH}
                        onScroll={Animated.event(
                            [
                                {
                                    nativeEvent: {
                                        contentOffset: {
                                            x: this.animation,
                                        },
                                    },
                                },
                            ],
                            {useNativeDriver: true}
                        )}
                        style={styles.scrollView}
                        contentContainerStyle={styles.endPadding}
                    >
                        {
                            getNearByLocation.map((location, index) => (
                                <ScrollCard key={index} data={location} navigation={this.props.navigation}/>
                            ))
                        }
                    </Animated.ScrollView>
                </View>)
            }}
            </Query>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        position: "absolute",
        bottom: 30,
        left: 0,
        right: 0,
        paddingVertical: 10,
    },
    endPadding: {
        paddingRight: width - CARD_WIDTH,
    }
});


export default MapComponent;
