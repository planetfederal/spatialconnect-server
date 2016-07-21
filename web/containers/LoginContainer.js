import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import LoginView from '../components/LoginView'
import * as authActions from '../ducks/auth';

export class LoginContainer extends Component {
  render () {
    return (
      <LoginView
        statusText={this.props.statusText}
        isAuthenticating={this.props.isAuthenticating}
        actions={this.props.actions}
        location={this.props.location}
        />
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticating: state.sc.auth.isAuthenticating,
  statusText: state.sc.auth.statusText
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(authActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginContainer);