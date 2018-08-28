import React, {Component} from 'react';
import NoteView from "../components/NoteView";

class MemoryScreen extends Component {
    render() {
        return (
            <NoteView navigation={this.props.navigation} data={this.props.navigation.state.params}/>
        )
    }
}


export default MemoryScreen;
