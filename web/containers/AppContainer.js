'use strict';
import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from '../components/Header';
import * as authActions from '../ducks/auth';

import '../style/App.less';

class AppContainer extends Component {
  render() {
    return (
      <div id="app">
        <Header
          isAuthenticated={this.props.isAuthenticated}
          logout={this.props.actions.logoutAndRedirect}
          userName={this.props.userName}
          />
        <div className="main-container">
          {this.props.children}
        </div>
        <footer></footer>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.sc.auth.isAuthenticated,
  userName: state.sc.auth.userName
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(authActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
