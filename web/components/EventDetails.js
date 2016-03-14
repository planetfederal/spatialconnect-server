'use strict';
import React, { PropTypes } from 'react';

const EventDetails = (props) => {
  const { params } = props;

  return (
    <div>
      <h4>EventId: {params.id}</h4>
      {props.children}
    </div>
  );
};
export default EventDetails;
