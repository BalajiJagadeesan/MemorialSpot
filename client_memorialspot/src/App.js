/**
 * Main App Screen where permission and initialization of credentials are done
 */
import React, {Component} from 'react';
import {
    PermissionsAndroid,
    Dimensions,
    NetInfo, View, Text, StyleSheet,
} from 'react-native';

import Reactotron from 'reactotron-react-native';
import {setupcache, setupClient} from "./config/apolloConfigurator";
import LoadingScreen from "./components/LoadingScreen";
import {ApolloProvider} from "react-apollo";
import {RouterTabs} from "./screens/RouterTabs";

const {width} = Dimensions.get('window');

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            statusMessage: "Loading",
            loading: true,
            errors: null,
            cache: null,
            client: null,
            region: null,
            network: 'none',
            isConnected:true,
        };
    }

    async componentDidMount() {
        const internet = await NetInfo.getConnectionInfo();
        NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
        this.setState({network: internet.type});
        if (this.state.network !== 'none') {
            let {cache, errors} = await setupcache();
            this.setState({cache});
            if (errors) {
                this._setErrorState(errors);
            }
            const location = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            if (location === false) {
                this.setState({statusMessage: "Requesting permission to access location"});
                let decision = await this._requestPermission();
                if (decision === true) {
                    await this._apolloClient();
                    this.setState({statusMessage: "Getting user location"});
                    this._getUserLocation();
                    if (!this.state.errors) {
                        this.setState({loading: false});
                    }
                } else {
                    this.setState({statusMessage: "Need location permission to proceed"});
                }
            } else {
                await this._apolloClient();
                this.setState({statusMessage: "Getting user location"});
                this._getUserLocation();
                if (!this.state.errors) {
                    this.setState({loading: false});
                }
            }
        } else {
            this.setState({statusMessage: "No internet connection"});
        }
    }

    /**
     * Apollo Client setup to execute graphQL queries
     */
    async _apolloClient() {
        if (this.state.cache) {
            const client = await setupClient(this.state.cache);
            this.setState({client});
        }
    }

    _setErrorState(error) {
        this.setState((prevState) => {
            if (prevState.errors === null) {
                return {errors: [error]}
            } else {
                let newErr = prevState.errors;
                return {errors: newErr.push(error)}
            }
        });
    }

    _getUserLocation() {
        navigator.geolocation.getCurrentPosition((position) => {
                const region = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: 0.0002,
                    longitudeDelta: 0.0005,
                };
                Reactotron.log(region);
                this.setState({region: region});
            },
            (err) => {
                Reactotron.log(err);
                this._setErrorState(err);
            },
            {
                enableHighAccuracy: true, timeout: 20000, distanceFilter: 10
            });
    }

    async _requestPermission() {
        try {
            const grant = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    'title': 'Location Permission',
                    'message': 'We require location permission to give memorials near to your location'
                }
            );
            return grant === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            this._setErrorState(err);
        }
    }

    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    }


    handleConnectivityChange = isConnected => {
        if (isConnected) {
            this.setState({isConnected});
        } else {
            this.setState({isConnected});
        }
    };

    render() {
        if (this.state.region !== null && this.state.client !== null) {
            return (
                <ApolloProvider client={this.state.client}>
                    <View style={{flex: 1}}>
                        <RouterTabs screenProps={
                            {
                                region: this.state.region,
                            }
                        }/>
                        {(!this.state.isConnected)
                            ? (<View style={styles.offlineContainer}>
                                <Text style={styles.offlineText}>Working in offline Mode (Unstable)</Text>
                            </View>): null
                        }
                    </View>
                </ApolloProvider>
            )
        }
        return (
            <LoadingScreen statusMessage={this.state.statusMessage}/>
        );
    }
}

const styles = StyleSheet.create({
    offlineContainer: {
        backgroundColor: '#b52424',
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        width,
        position: 'absolute',
        bottom: 0
    },
    offlineText: {color: '#fff'}
});

export default App
