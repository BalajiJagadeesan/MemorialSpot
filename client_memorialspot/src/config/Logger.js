/**
 * To log errors while development (troubleshooting)
 */
import Reactotron from 'reactotron-react-native'

Reactotron
    .configure({
        host : '10.0.0.39', //Localhost IP address
    }) // controls api & communication settings
    .useReactNative() // add all built-in react native plugins
    .connect() ;// let's connect!
