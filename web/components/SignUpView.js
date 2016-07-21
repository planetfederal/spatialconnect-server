import React, { Component } from 'react';
import { Link } from 'react-router';

export class LoginView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      password: ''
    };
  }

  submit(e) {
    e.preventDefault();
    this.props.actions.signUpUser(this.state.name, this.state.email, this.state.password);
  }

  emailChange(event) {
    this.setState({email: event.target.value});
  }

  passwordChange(event) {
    this.setState({password: event.target.value});
  }

  nameChange(event) {
    this.setState({name: event.target.value});
  }

  renderSuccessView() {
    return (
      <p>Sign up successful. <Link to="/login">Login</Link> with your new account.</p>
    );
  }

  renderErrorView() {
    return (
      <p>Error: {this.props.signUpError}</p>
    );
  }

  render () {
    return (
      <section className="main">
        <div className="side-form">
          {this.props.signUpError ? <div className='alert alert-danger'>{ this.renderErrorView() }</div> : ''}
          {this.props.signUpSuccess ? <div className='alert alert-info'>{ this.renderSuccessView() }</div> :
          <form role='form'>
            <div className='form-group'>
              <label htmlFor="name">Name</label>
              <input type='text'
                id='name'
                className='form-control'
                value={this.state.name}
                onChange={this.nameChange.bind(this)}
                disabled={this.props.isSigningUp}
                placeholder='Name' />
            </div>
            <div className='form-group'>
              <label htmlFor="email">Email</label>
              <input type='text'
                id='email'
                className='form-control'
                value={this.state.email}
                onChange={this.emailChange.bind(this)}
                disabled={this.props.isSigningUp}
                placeholder='Email' />
              </div>
            <div className='form-group'>
              <label htmlFor="password">Password</label>
              <input type='password'
                id="password"
                className='form-control'
                value={this.state.password}
                onChange={this.passwordChange.bind(this)}
                disabled={this.props.isSigningUp}
                placeholder='Password' />
            </div>
            <button type='submit'
              className='btn btn-sc'
              disabled={this.props.isSigningUp}
              onClick={this.submit.bind(this)}>Sign Up</button>
        </form> }
      </div>
    </section>
    );
  }
}

export default LoginView;