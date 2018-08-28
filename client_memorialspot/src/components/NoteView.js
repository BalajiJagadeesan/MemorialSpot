/**
 * To display Testimonials for a deceased person
 */
import React, {Component} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
// import Reactotron from 'reactotron-react-native';
import {Icon, Card} from 'react-native-elements';
import {colors} from "../config/init";

class NoteView extends Component {
    constructor(props) {
        super(props);
        // Reactotron.log(props);
    }

    _createNote(){
        let obj = {
            deceasedID : this.props.data.id,
            title: `${this.props.data.firstName}'s New`
        };
        this.props.navigation.navigate('CreateNote', obj);
    }

    render() {
        return (
            <ScrollView style={styles.container}>
                <View style={{flexDirection: "row", justifyContent: "flex-end"}}>
                    <Icon
                        raised
                        name='plus'
                        type='font-awesome'
                        size={20}
                        onPress={()=>{this._createNote()}}
                        color={colors.TEXT_BLACK}
                        containerStyle={{backgroundColor: colors.SECONDARY}}
                    />
                </View>
                <View style={{marginVertical:10}}>
                {
                    this.props.data.notes.map((note, index) => {
                        return (<Card key={index}>
                            <Text style={[styles.text, {textAlign: "center"}]}>"{note.note}"</Text>
                            <Text style={[styles.name, {textAlign: "center"}]}>-{note.nameOfPerson}</Text>
                        </Card>)
                    })
                }
                </View>
            </ScrollView>
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
    name: {
        fontSize: 14
    }
});

export default NoteView;
