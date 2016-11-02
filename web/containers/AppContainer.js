'use strict';
import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import * as authActions from '../ducks/auth';

import '../style/App.less';

class AppContainer extends Component {
  render() {
    return (
      <div id="app">
        <Header {...this.props} />
        <div className="main-container">
          <SideMenu {...this.props} />
          {this.props.children}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  console.log(ownProps);
  return {
    isAuthenticated: state.sc.auth.isAuthenticated,
    userName: state.sc.auth.userName,
    id: ownProps.params.id,
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(authActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
