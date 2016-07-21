'use strict';
import React, { PropTypes } from 'react';
import DataStoreItem from './DataStoreItem';
import DataStoreForm from './DataStoreForm';
import '../style/FormList.less';


const DataStoresList = ({ dataStores }) => (
  <div className="form-list">
    { dataStores.map(s => <DataStoreItem store={s} key={s.id} />) }
  </div>
);

DataStoresList.propTypes = {
  dataStores: PropTypes.array.isRequired
};

export default DataStoresList;
