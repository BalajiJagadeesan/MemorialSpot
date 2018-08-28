/**
 * This component is used to display error if a Query or Mutation fails with Apollo Errors
 */
import React, {Component} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {colors} from "../config/init";
import _ from 'lodash';
// import Reactotron from 'reactotron-react-native';

class ErrorComponent extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        // Reactotron.log(this.props.error);
        return (
            <View style={styles.container}>
                {
                    this.props.error.map((error,i) => {
                        if(error.details instanceof Array) {
                            return error.details.map((details, index) => {
                                return (<Text key={index} style={styles.error}>{details}</Text>)
                            });
                        }else{
                            return(<Text key={i} style={styles.error}>{error.details}</Text>)
                        }
                    })
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.TEXT_WHITE,
        marginVertical:10,
    },
    error: {
        color: "red",
        marginHorizontal:10,
    }

});
export default ErrorComponent;
