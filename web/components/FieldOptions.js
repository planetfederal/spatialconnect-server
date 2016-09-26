import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import { toKey } from '../utils';
import '../style/FormDetails.less';

let fieldOptions = {
  string: ['field_label', 'field_key', 'is_required', 'initial_value', 'minimum_length', 'maximum_length', 'pattern'],
  select: ['field_label', 'field_key', 'is_required', 'options'],
  number: ['field_label', 'field_key', 'is_required', 'initial_value', 'minimum', 'maximum', 'is_integer', 'exclusive_minimum', 'exclusive_maximum'],
  boolean: ['field_label', 'field_key', 'is_required' ],
  date: ['field_label', 'field_key', 'is_required' ],
  slider: ['field_label', 'field_key', 'is_required', 'initial_value', 'minimum', 'maximum'],
  counter: ['field_label', 'field_key', 'is_required', 'initial_value', 'minimum', 'maximum'],
  photo: ['field_label', 'field_key', 'is_required'],
};

let fieldLabels = {
  field_key: 'Field Key',
  field_label: 'Field Label',
  is_required: 'Required',
  is_integer: 'Integer',
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
    } else if (option === 'field_label') {
      value = e.target.value;
      this.props.updateFieldOption(
        this.props.form.get('id'),
        this.props.form.get('activeField'),
        'field_key',
        toKey(value)
      );
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
      if (o === 'is_integer' || o === 'is_required') {
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
            <label htmlFor={o}>{fieldLabels[o]}</label>
            <textarea className="form-control" rows="3"
              id={o}
              onChange={e => { this.changeOption(o, e)}}
              value={field.get(o, null) !== null ? field.get(o).join('\n') : ''}
              />
          </div>
        );
      }
      return (
        <div className="form-group" key={o+i}>
          <label htmlFor={o}>{fieldLabels[o]}</label>
          <input type="text" className="form-control"
            id={o}
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
          <button className="btn btn-danger" onClick={this.removeField.bind(this)}>Delete Field</button>
        </div>
      </div>
    );
  }
}

FieldOptions.propTypes = {
  form: PropTypes.object.isRequired,
  activeField: PropTypes.string,
};

export default FieldOptions;