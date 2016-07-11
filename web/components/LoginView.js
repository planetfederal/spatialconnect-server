import React, { Component } from 'react';

export class LoginView extends Component {

  constructor(props) {
    super(props);
    const redirectRoute = this.props.location.query.redirect || '/';
    this.state = {
      email: '',
      password: '',
      redirectTo: redirectRoute
    };
  }

  login(e) {
    e.preventDefault();
    this.props.actions.loginUser(this.state.email, this.state.password, this.state.redirectTo);
  }

  emailChange(event) {
    this.setState({email: event.target.value});
  }

  passwordChange(event) {
    this.setState({password: event.target.value});
  }

  render () {
    return (
      <div className='col-xs-12 col-md-6 col-md-offset-3'>
        <h3>Login</h3>
        {this.props.statusText ? <div className='alert alert-info'>{this.props.statusText}</div> : ''}
        <form role='form'>
        <div className='form-group'>
            <input type='text'
              className='form-control'
              value={this.state.email}
              onChange={this.emailChange.bind(this)}
              placeholder='Email' />
            </div>
          <div className='form-group'>
            <input type='password'
              className='form-control'
              value={this.state.password}
              onChange={this.passwordChange.bind(this)}
              placeholder='Password' />
          </div>
          <button type='submit'
            className='btn btn-sc'
            disabled={this.props.isAuthenticating}
            onClick={this.login.bind(this)}>Submit</button>
      </form>
    </div>
    );
  }
}

export default LoginView;