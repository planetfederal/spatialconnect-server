'use strict';
import React, { Component, PropTypes } from 'react';
import { find, values } from 'lodash';
import { toKey } from '../utils';

export const validate = (form, forms) => {
  const errors = {};

  if (!form.form_label) {
    errors.form_label = 'Required';
  }
  if (!form.form_key) {
    errors.form_key = 'Required';
  }
  var regex = /^[a-z_]*$/
  if (!regex.test(form.form_key)) {
    errors.form_key = 'Must only contain letters and underscores.';
  }
  let dupe = find(values(forms.toJS()), { form_key: form.form_key});
  if (dupe) {
    errors.form_key = 'Form Key must be unique.';
  }
  return errors;
};

export class FormCreate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: {},
      value: {
        form_label: '',
        form_key: ''
      }
    };
  }

  save() {
    let form = {
      form_label: this.refs.form_label.value,
      form_key: this.refs.form_key.value,
      version: 0,
      fields: []
    }
    let errors = validate(form, this.props.forms);
    this.setState({errors: errors});
    if(!Object.keys(errors).length) {
      this.props.onSubmit(form);
    }
  }

  onFormLabelChange() {
    let label = this.refs.form_label.value;
    let key = toKey(label);
    this.setState({
      value: {
        ...this.state.value,
        form_key: key
      }
    });
  }

  onFormKeyChange() {
    let key = this.refs.form_key.value;
    this.setState({
      value: {
        ...this.state.value,
        form_key: key
      }
    });
  }

  render() {
    return (
      <div className="side-form">
        <div className="form-group">
          <label>Form Name:</label>
          <input type="text" className="form-control" ref="form_label" defaultValue={this.state.value.form_label}
            onChange={this.onFormLabelChange.bind(this)} />
          {this.state.errors.form_label ? <p className="text-danger">{this.state.errors.form_label}</p> : ''}
        </div>
        <div className="form-group">
          <label>Form Key:</label>
          <input type="text" className="form-control" ref="form_key" value={this.state.value.form_key}
            onChange={this.onFormKeyChange.bind(this)}/>
          {this.state.errors.form_key ? <p className="text-danger">{this.state.errors.form_key}</p> : ''}
        </div>
        {(this.props.addFormError && !Object.keys(this.state.errors).length) ? <p className="text-danger">{this.props.addFormError}</p> : ''}
        <div className="btn-toolbar">
          <button className="btn btn-sc" onClick={this.save.bind(this)}>Create</button>
          <button className="btn btn-default" onClick={this.props.cancel}>Cancel</button>
        </div>
      </div>
    );
  }
};

FormCreate.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
  forms: PropTypes.object.isRequired,
  addFormError: PropTypes.string.isRequired
};

export default FormCreate;
