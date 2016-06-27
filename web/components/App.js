'use strict';
import React, { Component } from 'react';
import { Link } from 'react-router';
import '../style/App.less';

class App extends Component {
  render() {
    return (
      <div id="app">
        <header>
          <Link to="/">SpatialConnect Dashboard</Link>
          <nav>
            <Link to="/stores" activeClassName="active">Stores</Link>
            <Link to="/forms" activeClassName="active">Forms</Link>
          </nav>
        </header>
        <div className="main-container">
          {this.props.children}
        </div>
        <footer>

        </footer>
      </div>
    );
  }
}

export default App;
