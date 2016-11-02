import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

const TriggerItem = ({ trigger }) => (
  <div className="form-item">
    <h4><Link to={`/triggers/${trigger.id}`}>{trigger.name}</Link></h4>
    <p>{trigger.description}</p>
  </div>
);

TriggerItem.propTypes = {
  trigger: PropTypes.object.isRequired
};

export default TriggerItem;