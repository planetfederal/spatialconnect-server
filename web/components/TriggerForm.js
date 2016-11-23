import React, { Component } from 'react';

export const validate = values => {
  const errors = {};

  if (!values.name) {
    errors.name = 'Required';
  }

  return errors;
};

export class TriggerForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      repeat: false,
    };
  }

  save() {
    const newTrigger = {
      name: this.refs.name.value,
      description: this.refs.description.value,
      repeat: this.state.repeat,
    };
    const errors = validate(newTrigger);
    this.props.actions.updateTriggerErrors(errors);
    if(!Object.keys(errors).length) {
      this.props.create(newTrigger);
    }
  }

  handleOptionChange(e) {
    this.setState({ repeat: e.target.value === 'repeat_on' });
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
          <div className="radio">
            <label>
              <input type="radio" name="repeat" id="repeat_off" value="repeat_off"
                defaultChecked={!this.state.repeat}
                onChange={this.handleOptionChange.bind(this)} />
              Alert Once
            </label>
          </div>
          <div className="radio">
            <label>
              <input type="radio" name="repeat" id="repeat_on" value="repeat_on"
              defaultChecked={this.state.repeat}
              onChange={this.handleOptionChange.bind(this)} />
              Alert Always
            </label>
          </div>
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea className="form-control" rows="3"
            ref="description"
            defaultValue={trigger.description}
            />
          {errors.description ? <p className="text-danger">{errors.description}</p> : ''}
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