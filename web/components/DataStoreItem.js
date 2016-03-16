'use strict';
import React, { PropTypes } from 'react';
import DataStoreForm from './DataStoreForm';

const DataStoreItem = ({ dataStore, onSubmit }) => (
  <li className="list-item">
    <DataStoreForm
      initialValues={dataStore}
      formKey={dataStore.storeId}
      onSubmit={onSubmit}/>
  </li>
);

DataStoreItem.propTypes = {
  dataStore: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default DataStoreItem;
