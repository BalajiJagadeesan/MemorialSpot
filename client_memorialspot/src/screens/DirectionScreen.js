import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import MapView,{Marker} from 'react-native-maps';
import {api, colors} from "../config/init";
import MapViewDirections from 'react-native-maps-directions';
import {Icon} from 'react-native-elements';
import getDirections from 'react-native-google-maps-directions'

class DirectionScreen extends Component {
    constructor(props) {
        super(props);
    }

    _openExternalLink() {
        const data = {
            source: {
                latitude: this.props.screenProps.region.latitude,
                longitude: this.props.screenProps.region.longitude
            },
            destination: {
                latitude: parseFloat(this.props.navigation.state.params.location.latitude),
                longitude: parseFloat(this.props.navigation.state.params.location.longitude)
            },
            params: [
                {
                    key: "travelmode",
                    value: "walking"        // may be "walking", "bicycling" or "transit" as well
                }
            ]
        };

        getDirections(data)
    }

    _editLocationEntry() {
        let obj ={
            id: this.props.navigation.state.params.id,
            title : `${this.props.navigation.state.params.firstName} ${this.props.navigation.state.params.memoryType} location` ,
            type: "Location",
        };
        this.props.navigation.navigate('EditEntry',obj)
    }

    render() {
        return (
            <View style={styles.container}>
                <MapView style={styles.container} initialRegion={this.props.screenProps.region}
                         toolbarEnabled={true}
                         zoomControlEnabled={true}
                         showsCompass={true}
                >
                    <MapViewDirections
                        strokeWidth={3}
                        mode="walking"
                        origin={{
                            latitude: this.props.screenProps.region.latitude,
                            longitude: this.props.screenProps.region.longitude

                        }}
                        destination={
                            {
                                latitude: parseFloat(this.props.navigation.state.params.location.latitude),
                                longitude: parseFloat(this.props.navigation.state.params.location.longitude),
                            }
                        }
                        apikey={api.DIRECTIONS_API}
                    />
                    <Marker coordinate={
                        {
                            latitude: parseFloat(this.props.navigation.state.params.location.latitude),
                            longitude: parseFloat(this.props.navigation.state.params.location.longitude),
                        }
                    }
                    />
                </MapView>
                <View style={{position: 'absolute', bottom: 20, right: 20}}>
                    <Icon
                        raised
                        name='external-link'
                        type='font-awesome'
                        size={20}
                        onPress={() => this._openExternalLink()}
                        color={colors.TEXT_BLACK}
                        containerStyle={{backgroundColor: colors.SECONDARY}}
                    />
                    <Icon
                        raised
                        name='edit'
                        type='font-awesome'
                        size={20}
                        onPress={() => this._editLocationEntry()}
                        color={colors.TEXT_BLACK}
                        containerStyle={{backgroundColor: colors.SECONDARY}}
                    />

                </View>
            </View>
        );
    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }

});
export default DirectionScreen;
