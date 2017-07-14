import React, { Component, PropTypes } from 'react';

class SendMessage extends Component {
  state = { title: '', body: '', errors: {}, valid: false };

  validate = () => {
    let errors = {};
    if (!this.state.title) {
      errors.title = 'Title is required';
    }
    if (this.state.title.length > 50) {
      errors.title = 'Title must be less than 50 characters';
    }
    if (!this.state.body) {
      errors.body = 'Body is required';
    }
    if (this.state.body.length > 200) {
      errors.body = 'Title must be less than 200 characters';
    }
    this.setState({ errors });
    const valid = Object.keys(errors).length == 0;
    return valid;
  };

  onTitleChange = e => {
    this.setState({ title: e.target.value });
  };

  onBodyChange = e => {
    this.setState({ body: e.target.value });
  };

  onSubmit = e => {
    e.preventDefault();
    if (this.validate()) {
      console.log('submit');
    }
  };

  render() {
    return (
      <div className="side-form">
        <p>Send a notification message to all devices with EFC app installed:</p>
        <form role="form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              className="form-control"
              value={this.state.title}
              onChange={this.onTitleChange}
            />
            {this.state.errors.title
              ? <p className="text-danger">{this.state.errors.title}</p>
              : ''}
          </div>
          <div className="form-group">
            <label htmlFor="body">Body</label>
            <textarea
              className="form-control"
              rows="3"
              id="body"
              onChange={this.onBodyChange}
              value={this.state.body}
            />
            {this.state.errors.body ? <p className="text-danger">{this.state.errors.body}</p> : ''}
          </div>
          <div className="btn-toolbar">
            <button className="btn btn-sc" onClick={this.onSubmit}>Send</button>
            <button className="btn btn-default" onClick={this.props.cancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default SendMessage;
