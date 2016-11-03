'use strict';
import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import Sidebar from 'react-sidebar';
import * as authActions from '../ducks/auth';

import '../style/App.less';

const getWindowWidth = () => {
  let w = window,
      d = document,
      documentElement = d.documentElement,
      body = d.getElementsByTagName('body')[0],
      width = w.innerWidth || documentElement.clientWidth || body.clientWidth;

  return width;
}

class AppContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: getWindowWidth(),
      menuOpen: getWindowWidth() >= 600
    };
  }
  toggleMenu() {
    this.setState({ menuOpen: !this.state.menuOpen });
  }
  closeMenu() {
    if (this.state.width < 600) {
      this.setState({ menuOpen: false });
    }
  }
  updateDimensions() {
    this.setState({width: getWindowWidth()});
  }
  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }
  render() {
    return (
      <div id="app">
        <Header {...this.props} toggleMenu={this.toggleMenu.bind(this)} />
        <div className="main-container">
          <SideMenu {...this.props} closeMenu={this.closeMenu.bind(this)} menuOpen={this.state.menuOpen} />
          {this.props.children}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
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
