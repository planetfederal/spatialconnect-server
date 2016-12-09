import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const TriggerItem = ({ trigger }) => (
  <div className="form-item">
    <h4><Link to={`/triggers/${trigger.id}`}>{trigger.name}</Link></h4>
    <p>{trigger.description}</p>
    <p>{trigger.rules ?
      (trigger.rules.length + (trigger.rules.length === 1 ? ' rule' : ' rules'))
       : '0 rules'}
    </p>
  </div>
);

TriggerItem.propTypes = {
  trigger: PropTypes.object.isRequired,
};

export default TriggerItem;
