'use strict';
import React, { PropTypes } from 'react';
import { Link, browserHistory } from 'react-router';
import '../style/FormList.less';

const DataStoreItem = ({ store }) => (
  <div className="form-item" onClick={() => browserHistory.push(`/stores/${store.id}`)}>
    <h4><Link to={`/stores/${store.id}`}>{store.name}</Link></h4>
    <ul>
      <li><strong>ID:</strong> {store.id}</li>
      <li><strong>Type:</strong> {store.store_type}</li>
      <li><strong>URI:</strong> {store.uri}</li>
      {store.default_layers.length ? <li><strong>Default Layers:</strong>
        <ul>
        {store.default_layers.map(l => (
          <li key={l}>{l}</li>
        ))}
        </ul></li> : '' }
      <li><strong>Version:</strong> {store.version}</li>
    </ul>
  </div>
);

DataStoreItem.propTypes = {
  store: PropTypes.object.isRequired
};

export default DataStoreItem;