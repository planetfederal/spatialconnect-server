import React, { Component } from 'react';
import { without } from 'lodash';
import { isEmail } from '../utils';

export const validate = values => {
  const errors = {};

  if (!values.name) {
    errors.name = 'Required';
  }

  values.recipients.emails.forEach(email => {
    if (!isEmail(email)) {
      errors.email = 'Invalid email address';
    }
  });

  return errors;
};

export class TriggerForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      repeat: false,
      sourceStores: [],
      email_recipients: [],
    };
  }

  save() {
    const newTrigger = {
      name: this.refs.name.value,
      description: this.refs.description.value,
      repeated: this.state.repeat,
      stores: this.state.sourceStores,
      recipients: {
        emails: this.state.email_recipients,
        devices: [],
      },
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

  onSourceChange(e) {
    if (e.target.checked) {
      this.setState({
        sourceStores: this.state.sourceStores.concat(e.target.value)
      });
    } else {
      this.setState({
        sourceStores: without(this.state.sourceStores, e.target.value)
      });
    }
  }

  onEmailChange(e) {
    this.setState({
      email_recipients: e.target.value.split('\n')
    });
  }

  render() {
    const { trigger, errors, cancel, stores } = this.props;
    return (
      <div className="side-form">
        <div className="form-group">
          <label>Name:</label>
          <input type="text" className="form-control" ref="name" defaultValue={trigger.name} />
          {errors.name ? <p className="text-danger">{errors.name}</p> : ''}
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea className="form-control" rows="3"
            ref="description"
            defaultValue={trigger.description}
            />
          {errors.description ? <p className="text-danger">{errors.description}</p> : ''}
        </div>
        <div className="form-group">
          <label>Source Store:</label>
            {Object.keys(stores).map(id => (
              <div class="checkbox">
                  <input type="checkbox" defaultChecked={false}
                  defaultValue={id}
                  onChange={this.onSourceChange.bind(this)} /> {stores[id].name}
              </div>
            ))}
        </div>
        <div className="form-group">
        <label>Repeated:</label>
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
          <label>Email Recipients</label>
          <textarea className="form-control" rows="3"
            onChange={this.onEmailChange.bind(this)}
            defaultValue={this.state.email_recipients.join('\n')}
            />
            {errors.email ? <p className="text-danger">{errors.email}</p> : ''}
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