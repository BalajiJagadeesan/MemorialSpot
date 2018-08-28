/**
 * Contains Logic for navigation between screens
 */
import {TabNavigator, StackNavigator} from 'react-navigation';
import MapScreen from "./MapScreen";
import SearchScreen from "./SearchScreen";
import AboutScreen from './AboutScreen';
import {colors} from "../config/init";
import DirectionScreen from "./DirectionScreen";
import UserDetails from './UserDetails';
import MemoryScreen from "./MemoryScreen";
import EditHistoryScreen from "./EditHistoryScreen";
import NotesScreen from "./NotesScreen";
import CreatePersonScreen from "./CreatePersonScreen";
import CreateEditScreen from "./CreateEditScreen";
import {Icon} from 'react-native-elements';
import React from "react";
import CreateMemoryScreen from "./CreateMemoryScreen";
import CreateLocationScreen from "./CreateLocationScreen";
import CreateNotesScreen from "./CreateNotesScreen";
import CreateAdmin from "./CreateAdmin";

export const UserStack = StackNavigator({
    UserDetails: {
        screen: UserDetails,
        navigationOptions: ({navigation}) => ({
            title: `${navigation.state.params.firstName} ${navigation.state.params.lastName}`,
            tabBarVisible: false,
            headerStyle: {
                backgroundColor: colors.PRIMARY,
            },
            headerLeft: (<Icon
                name="arrow-left"
                type='material-community'
                size={25}
                onPress={() => {
                    navigation.goBack(null)
                }}
                color={colors.TEXT_WHITE}
                containerStyle={{marginHorizontal: 15}}
            />),
            headerRight: (<Icon
                raised
                name='plus'
                type='font-awesome'
                size={15}
                onPress={() => navigation.navigate('CreateUser')}
                color={colors.TEXT_BLACK}
                containerStyle={{backgroundColor: colors.SECONDARY}}
            />),
            swipeEnabled: false,
            headerTintColor: colors.TEXT_WHITE,
        })
    },
    ShowEditHistory: {
        screen: EditHistoryScreen,
        navigationOptions: ({navigation}) => ({
            title: "Person's edit History",
            tabBarVisible: false,
            headerStyle: {
                backgroundColor: colors.PRIMARY,
            },
            swipeEnabled: false,
            headerTintColor: colors.TEXT_WHITE,
        })
    },
    Notes: {
        screen: NotesScreen,
        navigationOptions: ({navigation}) => ({
            title: `${navigation.state.params.firstName}'s Testimonials`,
            tabBarVisible: false,
            headerStyle: {
                backgroundColor: colors.PRIMARY,
            },
            swipeEnabled: false,
            headerTintColor: colors.TEXT_WHITE,
        })
    },
    EditEntry: {
        screen: CreateEditScreen,
        navigationOptions: ({navigation}) => ({
            title: `${navigation.state.params.title}'s Edit entry`,
            tabBarVisible: false,
            headerStyle: {
                backgroundColor: colors.PRIMARY,
            },
            swipeEnabled: false,
            headerTintColor: colors.TEXT_WHITE,
        })
    },
    MemoryDetails: {
        screen: MemoryScreen,
        navigationOptions: ({navigation}) => ({
            title: `${navigation.state.params.firstName}'s ${navigation.state.params.memory.memoryType} Memorial`,
            tabBarVisible: false,
            headerStyle: {
                backgroundColor: colors.PRIMARY,
            },
            swipeEnabled: false,
            headerTintColor: colors.TEXT_WHITE,
        })
    },
    DirectionScreen: {
        screen: DirectionScreen,
        navigationOptions: ({navigation}) => ({
            title: `${navigation.state.params.firstName}'s Memorial Location`,
            tabBarVisible: false,
            headerStyle: {
                backgroundColor: colors.PRIMARY,
            },
            swipeEnabled: false,
            headerTintColor: colors.TEXT_WHITE,
        })
    },
    CreateUser: {
        screen: CreatePersonScreen,
        navigationOptions: ({navigation}) => ({
            title: `Create a new Person`,
            tabBarVisible: false,
            headerStyle: {
                backgroundColor: colors.PRIMARY,
            },
            swipeEnabled: false,
            headerTintColor: colors.TEXT_WHITE,
        })
    },
    CreateMemory: {
        screen: CreateMemoryScreen,
        navigationOptions: ({navigation}) => ({
            title: `${navigation.state.params.title}`,
            tabBarVisible: false,
            headerStyle: {
                backgroundColor: colors.PRIMARY,
            },
            swipeEnabled: false,
            headerTintColor: colors.TEXT_WHITE,
        })
    },
    CreateLocation: {
        screen: CreateLocationScreen,
        navigationOptions: ({navigation}) => ({
            title: `${navigation.state.params.title} Location Entry`,
            tabBarVisible: false,
            headerStyle: {
                backgroundColor: colors.PRIMARY,
            },
            swipeEnabled: false,
            headerTintColor: colors.TEXT_WHITE,
        })
    },
    CreateNote: {
        screen: CreateNotesScreen,
        navigationOptions: ({navigation}) => ({
            title: `${navigation.state.params.title} Testimonial Entry`,
            tabBarVisible: false,
            headerStyle: {
                backgroundColor: colors.PRIMARY,
            },
            swipeEnabled: false,
            headerTintColor: colors.TEXT_WHITE,
        })
    },

});


export const MapStack = StackNavigator({
    Map: {
        screen: MapScreen,
        navigationOptions: {
            header: null,
            headerMode: 'none'
        }
    },
    UserDetails: {
        screen: UserStack,
        navigationOptions: {
            header: null,
            headerMode: 'none',
        }
    },
    DirectionScreen: {
        screen: DirectionScreen,
        navigationOptions: ({navigation}) => ({
            title: `${navigation.state.params.firstName}'s Memorial Location`,
            tabBarVisible: false,
            headerStyle: {
                backgroundColor: colors.PRIMARY,
            },
            swipeEnabled: false,
            headerTintColor: colors.TEXT_WHITE,
        })
    },
    EditEntry: {
        screen: CreateEditScreen,
        navigationOptions: ({navigation}) => ({
            title: `${navigation.state.params.title}'s Edit entry`,
            tabBarVisible: false,
            headerStyle: {
                backgroundColor: colors.PRIMARY,
            },
            swipeEnabled: false,
            headerTintColor: colors.TEXT_WHITE,
        })
    },
});


export const SearchStack = StackNavigator({
    Search: {
        screen: SearchScreen,
        navigationOptions: {
            header: null,
            headerMode: 'none',
        }
    },
    UserDetails: {
        screen: UserStack,
        navigationOptions: {
            header: null,
            headerMode: 'none',
        }
    },
    DirectionScreen: {
        screen: DirectionScreen,
        navigationOptions: ({navigation}) => ({
            title: `${navigation.state.params.firstName}'s Memorial Location`,
            tabBarVisible: false,
            headerStyle: {
                backgroundColor: colors.PRIMARY,
            },
            swipeEnabled: false,
            headerTintColor: colors.TEXT_WHITE,
        })
    }
});

export const AboutStack = StackNavigator({
    About: {
        screen: AboutScreen,
        navigationOptions: {
            header: null,
            headerMode: 'none',
            tabBarLabel: "About"
        }
    },
    RequestAdmin: {
        screen: CreateAdmin,
        navigationOptions: ({navigation}) => ({
            title: `Request to become Admin`,
            tabBarVisible: false,
            headerStyle: {
                backgroundColor: colors.PRIMARY,
            },
            swipeEnabled: false,
            headerTintColor: colors.TEXT_WHITE,
        })
    }
});
export const RouterTabs = TabNavigator({
    Map: {
        screen: MapStack,
    },
    Search: {
        screen: SearchStack,
    },
    About: {
        screen: AboutStack,
    }
}, {
    tabBarOptions: {
        pressColor: '#ccc',
        indicatorStyle: {
            backgroundColor: colors.SECONDARY,
        },
        style: {
            backgroundColor: colors.PRIMARY,
        }
    }
});

