/**
 * This component is used to list the edits performed on an entry.
 */
import React, {Component} from 'react';
// import Reactotron from 'reactotron-react-native';
import {View, Text, StyleSheet} from "react-native";
import {Card} from 'react-native-elements';
import {colors} from "../config/init";

class HistoryView extends Component {
    constructor(props) {
        super(props);
        // Reactotron.log(props);
    }

    _decoupleName(index) {
        return (this.props.data.addedBy[index].split('-'))[0];
    }

    render() {
        let createdAt = new Date(this.props.data.createdAt).toLocaleString();
        let updatedAt = new Date(this.props.data.updatedAt).toLocaleString();
        return (
            <View style={styles.container}>
                <Card>
                    <Text style={styles.text}>createdAt: {createdAt}</Text>
                    <Text style={styles.text}>updatedAt: {updatedAt}</Text>
                </Card>
                <Text style={styles.title}>History:</Text>
                {

                    this.props.data.editorNotes.map((note, index) => {
                        return (<Card key={index}>
                            <Text style={styles.text}>"{note}"</Text>
                            <Text style={styles.name}>-{this._decoupleName(index)}</Text>
                        </Card>)
                    })
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.PRIMARY_DARK,
    },
    text: {
        fontSize: 16,
    },
    title: {
        color: colors.TEXT_WHITE,
        fontSize: 20,
        marginHorizontal:15,
        marginTop:10,
    },
    name: {
        fontSize: 14
    }
});

export default HistoryView;
