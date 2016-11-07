'use strict';
import React, { PropTypes } from 'react';
import { Link, browserHistory } from 'react-router';
import moment from 'moment';
import TriggerItem from './TriggerItem';
import '../style/FormList.less';

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
