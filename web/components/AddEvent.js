'use strict';
import React, { PropTypes } from 'react';

const AddEvent = ({ onClick }) => (
  <button onClick={onClick}>Add Event</button>
);

AddEvent.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default AddEvent;
