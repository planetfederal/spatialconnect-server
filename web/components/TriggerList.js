'use strict';
import React, { PropTypes } from 'react';
import { Link, browserHistory } from 'react-router';
import moment from 'moment';
import PropertyListItem from './PropertyListItem';
import '../style/FormList.less';

const TriggerItem = ({ trigger }) => (
  <div className="form-item">
    <h4><Link to={`/triggers/${trigger.id}`}>{trigger.name}</Link></h4>
    <p>{trigger.description}</p>
  </div>
);

TriggerItem.propTypes = {
  trigger: PropTypes.object.isRequired
};

const TriggerList = ({ spatial_triggers }) => (
  <div className="form-list">
    {spatial_triggers.map((t, i) => {
      return <TriggerItem trigger={t} key={'trigger.'+i} />
    })}
  </div>
);

TriggerList.propTypes = {
  spatial_triggers: PropTypes.object.isRequired
};

export default TriggerList;
