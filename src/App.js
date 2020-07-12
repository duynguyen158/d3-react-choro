import React, { Component } from 'react';
import './App.css';
import Choropleth from './Choropleth';

import { csv } from 'd3-fetch';
import data from './data/unemployment-x.csv';

class App extends Component {
    constructor() {
        super();
        this.state = {
            data: null
        }
    }

    componentDidMount() {
        csv(data)
            .then(data => this.setState({
                data: new Map(data.map(d => [d.id, +d.rate]))
            }));
    }

    render() {
        if (this.state.data !== null) {
            return (
                <div className="App">
                    <div className="App-header">
                    </div>
                    <div>
                        <Choropleth 
                            data={this.state.data}
                            width={1000}
                            height={640}
                        />
                    </div>
                </div>
            );
        } else {
            return <p></p>;
        }
    }
}

export default App;
