/**
 * This component is an activity indicator to represent loading status of Query and Mutation
 */
import React, {Component} from 'react';
import {View,ActivityIndicator,StyleSheet} from 'react-native';
import {colors} from "../config/init";

class LoadingIndicator extends Component {
    render() {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={colors.TEXT_WHITE} />
            </View>
        );
    }
}

const styles = StyleSheet.create({

   container:{
       flex:1,
       justifyContent:"center",
       backgroundColor:colors.PRIMARY_DARK
   }
});

export default LoadingIndicator;
