'use strict';
import React, { PropTypes } from 'react';
import { Link, browserHistory } from 'react-router';

const DataStoreDetails = ({ store, deleteStore, editStore }) => (
  <div className="store-details">
    <p>Name: {store.name}</p>
    <p>Type: {store.store_type}</p>
    <p>Version: {store.version}</p>
    <p>URI: {store.uri}</p>
    {store.default_layer ? <p>Default Layer: {store.default_layer}</p> : ''}
    <div className="btn-toolbar">
      <button className="btn btn-sc" onClick={() => { editStore(store.id) }}>Edit Store</button>
      <button className="btn btn-danger" onClick={() => { deleteStore(store.id) }}>Delete Store</button>
    </div>
  </div>
);

DataStoreDetails.propTypes = {
  store: PropTypes.object.isRequired
};

export default DataStoreDetails;