import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import '../style/FormDetails.less';

let fieldOptions = {
  string: ['key', 'name', 'is_required', 'initial_value', 'minimum_length', 'maximum_length', 'pattern'],
  select: ['key', 'name', 'is_required', 'options'],
  number: ['key', 'name', 'is_required', 'initial_value', 'minimum', 'maximum', 'integer', 'exclusive_minimum', 'exclusive_maximum'],
  boolean: ['key', 'name', 'is_required' ],
  date: ['key', 'name', 'is_required' ],
  slider: ['key', 'name', 'is_required', 'initial_value', 'minimum', 'maximum'],
  counter: ['key', 'name', 'is_required', 'initial_value', 'minimum', 'maximum']
};

let fieldLabels = {
  key: 'Data Name',
  name: 'Display Name',
  is_required: 'Required',
  isInteger: 'Integer',
  initial_value: 'Default Value',
  minimum_length: 'Minimum Length',
  maximum_length: 'Maximum Length',
  pattern: 'Validation Pattern',
  options: 'Options',
  minimum: 'Minimum',
  maximum: 'Maximum',
  exclusive_minimum: 'Exclusive Minimum',
  exclusive_maximum: 'Exclusive Maximum'
};

class FieldOptions extends Component {

  changeOption(option, e) {
    let value;
    if (e.currentTarget.type == 'checkbox') {
      value = e.target.checked;
    } else if (option === 'options') {
      value = e.target.value.split('\n');
    } else {
      value = e.target.value;
    }
    this.props.updateFieldOption(
      this.props.form.get('id'),
      this.props.form.get('activeField'),
      option,
      value
    );
  }

  removeField() {
    this.props.removeField(
      this.props.form.get('id'),
      this.props.form.get('activeField')
    );
  }

  makeOptionInput(field) {
    return fieldOptions[field.get('type')].map((o, i) => {
      if (o === 'integer' || o === 'is_required') {
        return (
          <div className="checkbox" key={o+i}>
            <label>
              <input type="checkbox"
                checked={
                  (field.get(o, null) !== null && field.get(o, null) === true) ? true : false
                }
                onChange={e => { this.changeOption(o, e)}}
              /> {fieldLabels[o]}
            </label>
          </div>
        );
      }
      if (o === 'options') {
        return (
          <div className="form-group" key={o+i}>
            <label htmlFor="exampleInputEmail1">{fieldLabels[o]}</label>
            <textarea className="form-control" rows="3"
              onChange={e => { this.changeOption(o, e)}}
              value={field.get(o, null) !== null ? field.get(o).join('\n') : ''}
              />
          </div>
        );
      }
      return (
        <div className="form-group" key={o+i}>
          <label htmlFor="exampleInputEmail1">{fieldLabels[o]}</label>
          <input type="text" className="form-control"
            value={field.get(o, null) !== null ? field.get(o) : ''}
            onChange={e => { this.changeOption(o, e)}}
           />
        </div>
      );
    });
  }

  render() {
    const { form } = this.props;
    let activeField = form.get('activeField', null)
    if (activeField === null) {
      return (
        <div className="form-options form-pane">
          <div className="form-pane-title"><h5>Field Options</h5></div>
          <div className="form-pane-wrapper">
            <p className="warning-message">Select field.</p>
          </div>
        </div>
      );
    }
    let field = form.getIn(['fields', form.get('fields').findIndex(f => f.get('id') === activeField)]);
    let optionInputs = this.makeOptionInput(field);
    return (
      <div className="form-options form-pane">
        <div className="form-pane-title"><h5>Field Options</h5></div>
        <div className="form-pane-wrapper">
          {optionInputs}
          <button className="btn btn-default" onClick={this.removeField.bind(this)}>Remove</button>
        </div>
      </div>
    );
  }
}

FieldOptions.propTypes = {
  form: PropTypes.object.is_required,
  activeField: PropTypes.string.is_required,
};

export default FieldOptions;