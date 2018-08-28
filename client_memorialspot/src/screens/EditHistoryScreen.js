import React, {Component} from 'react';
import HistoryView from '../components/HistoryView';
class EditHistoryScreen extends Component {
    render() {
        return (
            <HistoryView navigation={this.props.navigation} data={this.props.navigation.state.params}/>
        );
    }
}


export default EditHistoryScreen;
