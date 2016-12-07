import React, { PropTypes } from 'react';
import TriggerItem from './TriggerItem';
import '../style/FormList.less';

const TriggerList = ({ spatial_triggers }) => (
  <div className="form-list">
    {Object.keys(spatial_triggers).map(k =>
      <TriggerItem trigger={spatial_triggers[k]} key={spatial_triggers[k].id} />)}
  </div>
);

TriggerList.propTypes = {
  spatial_triggers: PropTypes.object.isRequired,
};

export default TriggerList;
