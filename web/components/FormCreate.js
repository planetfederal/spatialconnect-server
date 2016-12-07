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
  const regex = /^[a-z_]*$/;
  if (!regex.test(form.form_key)) {
    errors.form_key = 'Must only contain letters and underscores.';
  }
  const dupe = find(values(forms.toJS()), { form_key: form.form_key });
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
      form_label: '',
      form_key: '',
    };

    this.onFormLabelChange = this.onFormLabelChange.bind(this);
    this.onFormKeyChange = this.onFormKeyChange.bind(this);
    this.save = this.save.bind(this);
  }

  onFormLabelChange(e) {
    const label = e.target.value;
    this.setState({
      form_label: label,
      form_key: toKey(label),
    });
  }

  onFormKeyChange(e) {
    this.setState({ form_key: e.target.value });
  }

  save() {
    const form = {
      form_label: this.state.form_label,
      form_key: this.state.form_key,
      version: 1,
      fields: [],
    };
    const errors = validate(form, this.props.forms);
    this.setState({ errors });
    if (!Object.keys(errors).length) {
      this.props.onSubmit(form);
    }
  }

  render() {
    return (
      <div className="side-form">
        <div className="form-group">
          <label htmlFor="form-name">Form Name:</label>
          <input
            id="form-name" type="text" className="form-control"
            value={this.state.form_label}
            onChange={this.onFormLabelChange}
          />
          {this.state.errors.form_label ? <p className="text-danger">{this.state.errors.form_label}</p> : ''}
        </div>
        <div className="form-group">
          <label htmlFor="form-key">Form Key:</label>
          <input
            id="form-key" type="text" className="form-control"
            value={this.state.form_key}
            onChange={this.onFormKeyChange}
          />
          {this.state.errors.form_key ? <p className="text-danger">{this.state.errors.form_key}</p> : ''}
        </div>
        {(this.props.addFormError && !Object.keys(this.state.errors).length) ? <p className="text-danger">{this.props.addFormError}</p> : ''}
        <div className="btn-toolbar">
          <button className="btn btn-sc" onClick={this.save}>Create</button>
          <button className="btn btn-default" onClick={this.props.cancel}>Cancel</button>
        </div>
      </div>
    );
  }
}

FormCreate.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
  forms: PropTypes.object.isRequired,
  addFormError: PropTypes.string.isRequired,
};

export default FormCreate;
