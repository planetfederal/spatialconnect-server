'use strict';
import React, { PropTypes } from 'react';
import DataStoreItem from './DataStoreItem';

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
