/**
 * Initial Loading Screen for the application
 */
import React, {Component} from 'react';

import {StyleSheet, Text, Image, ImageBackground, Dimensions} from 'react-native';
import LottieView from 'lottie-react-native';
import {colors} from "../config/init";

const {height} = Dimensions.get('window');
class LoadingScreen extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount(){
        this.lottieAnimation.play();
    }
    render() {
        return (
            <ImageBackground source={require('../assets/background.png')}
                             style={styles.container} blurRadius={0.3}>
                <Image source={require('../assets/title.png')} style={styles.title}/>
                <LottieView style={styles.lottieContainer} ref={animation => {
                    this.lottieAnimation = animation;
                }}
                            source={require('../assets/preloader.json')}
                />
                <Text style={styles.status}>{this.props.statusMessage}</Text>
            </ImageBackground>

        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        marginTop: height * 0.2,
    },
    lottieContainer:{
        width: 250,
        height:100,
        marginTop: height * 0.4,
    },
    status:{
        color: colors.TEXT_WHITE,
        textAlign: "center",
    }
});


export default LoadingScreen;
