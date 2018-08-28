import React, {Component} from 'react';
import MapComponent from '../components/MapComponent';
import Reactotron from 'reactotron-react-native';

class MapScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            latitude: this.props.screenProps.region.latitude,
            longitude: this.props.screenProps.region.longitude
        }
    }

    componentDidMount() {
        this.watchId = navigator.geolocation.watchPosition((position) => {
                this.setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                Reactotron.log(this.state.latitude + "," + this.state.longitude);
            },
            (error) => {
                this.setState({error: error.message});
            },
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000, distanceFilter: 10}
        );
    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchId);
    }

    render() {
        return (
            <MapComponent initialRegion={this.props.screenProps.region}
                          latitude={this.state.latitude} longitude={this.state.longitude}
                          navigation={this.props.navigation}
            />
        )
    }
}


export default MapScreen;
