'use strict';
import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';

const fields = ['name', 'description']

export const validate = values => {
  const errors = {};
  if (!values.name) {
    errors.name = 'Required';
  }
  if (!values.description) {
    errors.description = 'Required';
  }

  return errors;
};

export class NewEventForm extends Component  {

  render() {
    const { fields: { name, description }, handleSubmit, submitNewEvent } = this.props;

    return (
      <form onSubmit={handleSubmit(submitNewEvent)}>
        <div>
          <label>Event Name</label>
          <input
            {...name}
            ref="name"
            type="text"
            placeholder="enter the name of your event" />
            {name.touched && name.error && <div>{name.error}</div>}
        </div>
        <div>
          <label>Description</label>
          <div>
            <textarea
              {...description}
              ref="description"
              value={description.value || ''}
            />
          </div>
          {description.touched && description.error && <div>{description.error}</div>}
        </div>
        <button type="submit">Create Event</button>
      </form>
    );
  }
};

const NewEventFormRedux = reduxForm({
  form: 'newEvent',
  fields,
  validate
})(NewEventForm);

export default NewEventFormRedux;
