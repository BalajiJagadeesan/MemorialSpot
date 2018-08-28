import React, {Component} from 'react';
import MemoryView from "../components/MemoryView";

class MemoryScreen extends Component {
    render() {
        return (
            <MemoryView navigation={this.props.navigation} data={this.props.navigation.state.params.memory}/>
        )
    }
}


export default MemoryScreen;
