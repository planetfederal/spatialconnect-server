'use strict';
import React, { PropTypes } from 'react';
import DataStoreItem from './DataStoreItem';
import DataStoreForm from './DataStoreForm';
import '../style/FormList.less';


const DataStoresList = ({ dataStores, selectedTeamId }) => (
  <div className="form-list">
    {Object.keys(dataStores).map(k => {
      let s = dataStores[k];
      return selectedTeamId === s.team_id ? <DataStoreItem store={s} key={s.id} /> : null;
    })}
  </div>
);

DataStoresList.propTypes = {
  dataStores: PropTypes.object.isRequired,
  selectedTeamId: PropTypes.number.isRequired,
};

export default DataStoresList;
