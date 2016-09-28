import React, { Component } from 'react';

export const validate = values => {
  const errors = {};

  if (!values.name) {
    errors.name = 'Required';
  }
  if (!values.type) {
    errors.store_type = 'Required';
  }
  return errors;
};

export class TriggerForm extends Component {

  save() {
    const newTrigger = {
      name: this.refs.name.value,
      type: this.refs.type.value
    };
    const errors = validate(newTrigger);
    this.props.actions.updateTriggerErrors(errors);
    if(!Object.keys(errors).length) {
      this.props.create(newTrigger);
    }
  }

  render() {
    const { trigger, errors, cancel } = this.props;
    return (
      <div className="side-form">
        <div className="form-group">
          <label>Name:</label>
          <input type="text" className="form-control" ref="name" defaultValue={trigger.name} />
          {errors.name ? <p className="text-danger">{errors.name}</p> : ''}
        </div>
        <div className="form-group">
          <label>Type:</label>
          <select className="form-control" ref="type"  defaultValue={trigger.type}>
            <option value="geofence">geofence</option>
          </select>
          {errors.type ? <p className="text-danger">{errors.type}</p> : ''}
        </div>
        <div className="btn-toolbar">
          <button className="btn btn-sc" onClick={this.save.bind(this)}>Create</button>
          <button className="btn btn-default" onClick={cancel}>Cancel</button>
        </div>
      </div>
    );
  }
}

export default TriggerForm;