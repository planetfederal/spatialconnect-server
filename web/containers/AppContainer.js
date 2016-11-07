'use strict';
import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { delay } from 'lodash';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import Sidebar from 'react-sidebar';
import * as authActions from '../ducks/auth';
import * as menuActions from '../ducks/menu';

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
      width: getWindowWidth()
    };
  }
  toggleMenu() {
    this.props.menuActions.toggleMenu();
  }
  closeMenu() {
    if (this.state.width < 600) {
      this.props.menuActions.closeMenu();
    }
  }
  updateDimensions() {
    this.setState({width: getWindowWidth()});
  }
  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions.bind(this));
    if (getWindowWidth() >= 600) {
      this.props.menuActions.openMenu();
    } else {
      this.props.menuActions.closeMenu();
    }
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }
  render() {
    return (
      <div id="app">
        <Header {...this.props} toggleMenu={this.toggleMenu.bind(this)} />
        <div className="main-container">
          <SideMenu {...this.props} closeMenu={this.closeMenu.bind(this)} menuOpen={this.props.menu.open} />
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
    menu: state.sc.menu
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(authActions, dispatch),
  menuActions: bindActionCreators(menuActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
