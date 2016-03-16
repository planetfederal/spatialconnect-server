'use strict';
import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';

let DataStoreForm = (props) => {
  const {
    fields: { id, storeId, name, type, version },
    handleSubmit
  } = props;

  return (
    <form>
      <div>
        <label>ID:</label>
        <span>{storeId.initialValue}</span>
        <input
          {...storeId}
          type="text"
          hidden />
      </div>
      <div>
        <label>Name</label>
        <input
          {...name}
          type="text"
          placeholder="enter the name for the data store" />
      </div>
      <div>
        <label>Type</label>
        <div>
          <select {...type}>
            <option value="">Select a type..</option>
            <option value="geojson">GeoJSON</option>
            <option value="gpkg">GeoPackage</option>
          </select>
        </div>
      </div>
      <div>
        <label>Version</label>
        <input
          {...version}
          type="text"
          placeholder="enter a version for the store's type" />
      </div>
    </form>
  );
};

DataStoreForm = reduxForm({
  form: 'dataStore',
  fields: ['id', 'storeId', 'name', 'type', 'version']
})(DataStoreForm);

export default DataStoreForm;
