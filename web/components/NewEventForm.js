'use strict';
import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';

let NewEventForm = (props) => {
  const { fields: { name, description }, handleSubmit, submitNewEvent } = props;

  return (
    <form onSubmit={handleSubmit(submitNewEvent)}>
      <div>
        <label>Event Name</label>
        <input
          {...name}
          type="text"
          placeholder="enter the name of your event" />
      </div>
      <div>
        <label>Description</label>
        <div>
          <textarea
            {...description}
            value={description.value || ''}
          />
        </div>
      </div>
      <button type="submit">Create Event</button>
    </form>
  );
};

NewEventForm = reduxForm({
  form: 'newEvent',
  fields: ['name', 'description']
})(NewEventForm);

export default NewEventForm;
