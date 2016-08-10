'use strict';
import React, { PropTypes } from 'react';
import { Link, browserHistory } from 'react-router';

const DataStoreDetails = ({ store, deleteStore, editStore }) => (
  <div className="store-details">
    <ul>
      <li><strong>Name:</strong> {store.name}</li>
      <li><strong>Type:</strong> {store.store_type}</li>
      <li><strong>Version:</strong> {store.version}</li>
      <li><strong>URI:</strong> {store.uri}</li>
      {store.default_layers.length ? <li><strong>Default Layers:</strong>
        <ul>
        {store.default_layers.map(l => (
          <li key={l}>{l}</li>
        ))}
        </ul></li> : null}
    </ul>
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