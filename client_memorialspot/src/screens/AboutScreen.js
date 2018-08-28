import React, {Component} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';

import {colors, images} from "../config/init";
import {ListItem} from "react-native-elements";

class AboutScreen extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={styles.container}>
                <ListItem
                    style={styles.listItem}
                    key={1}
                    title="Apply to become administrator"
                    chevron
                    onPress={() => {
                        this.props.navigation.navigate('RequestAdmin');
                    }}
                />
                <View style={styles.formView}>
                    <Image
                        source={images.title}
                    />
                    <Text style={styles.big}>Developed By</Text>
                    <Text style={styles.small}>Balaji Jagadeesan</Text>
                    <Text style={styles.big}>Under Supervision of</Text>
                    <Text style={styles.small}>Dr. Deborah Labelle</Text>
                    <Text style={styles.small}>Prof. Bryan French</Text>
                    <Text style={styles.extraSmall}>towards capstone completion</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.PRIMARY_DARK,
    },
    listItem: {
        marginVertical: 10,
        marginHorizontal: 10,
    },
    formView: {
        marginHorizontal: 10,
        marginVertical: 10,
        paddingVertical: 10,
        alignItems: "center",
        backgroundColor: colors.TEXT_WHITE,
    },
    divider: {
        paddingVertical: 10,
    },
    title: {
        fontSize: 16,
        color: colors.TEXT_WHITE,
        textAlign: "center",
    },
    picker: {
        height: 50,
        marginVertical: 10,
        marginHorizontal: 10,
        backgroundColor: colors.TEXT_WHITE,
        borderRadius: 75
    },
    big: {
        color: colors.TEXT_BLACK,
        fontSize: 22
    },
    small: {
        color: colors.TEXT_BLACK,
        fontSize: 18,
    },
    extraSmall: {
        color: colors.TEXT_BLACK,
        fontSize: 16
    }
});


export default AboutScreen;
