import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SignUpView from '../components/SignUpView'
import * as authActions from '../ducks/auth';

export class SignUpContainer extends Component {
  render () {
    return (
      <SignUpView
        signUpError={this.props.signUpError}
        signUpSuccess={this.props.signUpSuccess}
        isSigningUp={this.props.isSigningUp}
        actions={this.props.actions}
        location={this.props.location}
        />
    );
  }
}

const mapStateToProps = (state) => ({
  signUpError: state.sc.auth.signUpError,
  signUpSuccess: state.sc.auth.signUpSuccess,
  isSigningUp: state.sc.auth.isSigningUp
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(authActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(SignUpContainer);