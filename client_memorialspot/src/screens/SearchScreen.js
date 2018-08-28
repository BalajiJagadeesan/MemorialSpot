import React, {Component} from 'react';
import {View, Text, StyleSheet, Picker, ScrollView} from 'react-native';
import Reactotron from 'reactotron-react-native';
import {colors} from "../config/init";
import {SearchBar, Icon, Button} from 'react-native-elements';
import {Query} from 'react-apollo';
import {getDeceasedByName, getMemoryByType} from "../graphql/queries";
import LoadingIndicator from "../components/LoadingIndicator";
import SearchListPerson from "../components/SearchListPerson";
import ErrorComponent from "../components/ErrorComponent";
import {cycleErrors} from "../config/helpers";


let moreData = true; //for status check on button to load more data

class SearchScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: "name",
            term: "",
            memoryType: "none",
            data:{},
        };
        this.typingTimeout = 0;
    }

    _resolveName() {
        const array = this.state.term.split(" ");
        if (array.length >= 2) {
            return {
                firstName: "" + array.splice(array.length - 1, 1).join(" "),
                lastName: "" + array[array.length - 1],
                limit: 5,
                offset: 0,
            }
        }
        return {
            firstName: "" + this.state.term,
            lastName: "",
            limit: 5,
            offset: 0,
        }
    }

    /**
     * For delay between typing and querying server
     * @param value -input value
     * @private
     */
    _finishedTyping(value) {
        if (this.typingTimeout) clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.setState({term: value});
        }, 700);
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Search by:</Text>
                <Picker
                    mode='dropdown'
                    selectedValue={this.state.query}
                    style={styles.picker}
                    onValueChange={(itemValue) => this.setState({
                        query: itemValue,
                        term: "",
                        memoryType: 'none'
                    })}
                >
                    <Picker.Item label="Name" value="name"/>
                    <Picker.Item label="MemorialType" value="memoryType"/>
                </Picker>
                {
                    (this.state.query === 'name') ? <SearchBar
                        round
                        lightTheme
                        containerStyle={styles.searchBox}
                        onChangeText={(value) => this._finishedTyping(value)}
                        onClearText={() => this.setState({term: ""})}
                        placeholder='Type Name here...'/> : null
                }
                {
                    (this.state.query === 'memoryType') ? <Picker
                        mode='dropdown'
                        selectedValue={this.state.memoryType}
                        style={styles.memoryPicker}
                        onValueChange={(itemValue) => this.setState({memoryType: itemValue})}
                    >
                        <Picker.Item label="Select one type" value="none"/>
                        <Picker.Item label="Tree" value="TREE"/>
                        <Picker.Item label="Bench" value="BENCH"/>
                        <Picker.Item label="Garden" value="GARDEN"/>
                        <Picker.Item label="Others" value="OTHER"/>
                    </Picker> : null
                }
                <Text style={styles.title}>ListView</Text>
                <ScrollView style={styles.list}>
                    {(this.state.term === "" && this.state.memoryType === 'none')
                        ? <Text style={styles.title}>ListView is empty</Text>
                        : null
                    }
                    {(this.state.query === 'name' && this.state.term) ?
                        <Query query={getDeceasedByName} variables={this._resolveName()}>
                            {({loading, error, data: {getDeceasedByName}, fetchMore}) => {
                                if (loading) return (<LoadingIndicator/>);
                                if (error) {
                                    return (<ErrorComponent error={cycleErrors(error.graphQLErrors)}/>)
                                }
                                return ([getDeceasedByName.map((person, index) => {
                                    return (
                                        <SearchListPerson
                                            key={index}
                                            navigation={this.props.navigation}
                                            data={{
                                                id: person.id,
                                                firstName: person.firstName,
                                                lastName: person.lastName,
                                                image: person.profilePic,
                                                dateOfBirth: person.dateOfBirth,
                                                dateOfDeath: person.dateOfDeath,
                                            }}

                                        />);
                                })
                                    , (getDeceasedByName.length > 0)
                                        ?
                                        ((moreData) ?
                                            (<Button key="2" title="Load More"
                                                     titleStyle={{color: colors.TEXT_BLACK}}
                                                     buttonStyle={{
                                                         backgroundColor: colors.SECONDARY
                                                     }}
                                                     onPress={() => fetchMore({
                                                         variables: {
                                                             offset: getDeceasedByName.length
                                                         },
                                                         updateQuery: (prev, {fetchMoreResult}) => {
                                                             if (!fetchMoreResult) {
                                                                 return prev
                                                             }
                                                             return Object.assign({}, prev, {
                                                                 getDeceasedByName: [...getDeceasedByName, ...fetchMoreResult.getDeceasedByName]
                                                             });
                                                         }
                                                     })}/>) : null)
                                        : <Text style={styles.title}>No list for search criteria</Text>
                                ])
                            }}
                        </Query>
                        : null
                    }
                    {
                        (this.state.query === 'memoryType' && this.state.memoryType !== 'none') ?
                            <Query query={getMemoryByType} variables={{
                                type: this.state.memoryType,
                                limit: 10,
                                offset: 0
                            }}>
                                {({loading, error, data: {getMemoryByType}, fetchMore}) => {
                                    if (loading) return (<LoadingIndicator/>);
                                    if (error) {
                                        return (<ErrorComponent error={cycleErrors(error.graphQLErrors)}/>)
                                    }
                                    return (
                                        [
                                            getMemoryByType.map((memory, index) => {
                                                return (
                                                    <SearchListPerson
                                                        key={index} navigation={this.props.navigation}
                                                        data={{
                                                            id: memory.deceasedPerson.id,
                                                            firstName: memory.deceasedPerson.firstName,
                                                            lastName: memory.deceasedPerson.lastName,
                                                            image: memory.deceasedPerson.profilePic,
                                                            dateOfBirth: memory.deceasedPerson.dateOfBirth,
                                                            dateOfDeath: memory.deceasedPerson.dateOfDeath,
                                                            memoryID: memory.id,
                                                        }}
                                                    />);
                                            })
                                            , (getMemoryByType.length > 0)
                                            ?
                                            ((moreData) ?
                                                (<Button key="2" title="Load More"
                                                         titleStyle={{color: colors.TEXT_BLACK}}
                                                         buttonStyle={{
                                                             backgroundColor: colors.SECONDARY
                                                         }}
                                                         onPress={() => fetchMore({
                                                             variables: {
                                                                 offset: getMemoryByType.length
                                                             },
                                                             updateQuery: (prev, {fetchMoreResult}) => {
                                                                 if (!fetchMoreResult) {
                                                                     return prev
                                                                 }
                                                                 return Object.assign({}, prev, {
                                                                     getMemoryByType: [...getMemoryByType, ...fetchMoreResult.getMemoryByType]
                                                                 });
                                                             }
                                                         })}/>) : null)
                                            : <Text style={styles.title}>No list for search criteria</Text>
                                        ]
                                    )
                                }}
                            </Query> : null
                    }
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.PRIMARY_DARK,
    },
    list: {
        marginHorizontal: 10,
        marginVertical: 10,
    },
    text: {
        textAlign: "center",
        fontSize: 16
    },
    name: {
        fontSize: 14
    },
    picker: {
        height: 50,
        marginVertical: 10,
        marginHorizontal: 10,
        backgroundColor: colors.TEXT_WHITE,
        borderRadius: 75
    },
    memoryPicker: {
        height: 50,
        marginHorizontal: 10,
        backgroundColor: colors.TEXT_WHITE,
        borderRadius: 75
    },
    title: {
        color: colors.TEXT_WHITE,
        fontSize: 18,
        marginTop: 10,
        marginHorizontal: 10,
    },
    searchBox: {
        marginHorizontal: 10,

    }
});

export default SearchScreen;
