'use strict';
import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import DataStoreForm from '../components/DataStoreForm';

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

const DataStoresList = ({ dataStores, onSubmit }) => (
  <ul className="list">
    {dataStores.map(store =>
      <DataStoreItem key={store.id} dataStore={store} onSubmit={onSubmit} />
    )}
  </ul>
);

DataStoresList.propTypes = {
  dataStores: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default DataStoresList;
