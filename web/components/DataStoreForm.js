'use strict';
import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';

const fields = ['id', 'storeId', 'name', 'type', 'version']

export const validate = values => {
  const errors = {};

  if (!values.storeId) {
    errors.storeId = 'Required';
  }
  if (!values.name) {
    errors.name = 'Required';
  }
  if (!values.type) {
    errors.type = 'Required';
  }
  if (!values.version) {
    errors.version = 'Required';
  }

  return errors;
};

export class DataStoreForm extends Component {
  render() {
    const {
      fields: { id, storeId, name, type, version },
      handleSubmit
    } = this.props;
    return (
      <form>
        <div>
          <label>ID:</label>
          <span>{storeId.initialValue}</span>
          <input
            {...storeId}
            type="text"
            hidden />
            {storeId.touched && storeId.error && <div>{storeId.error}</div>}
        </div>
        <div>
          <label>Name</label>
          <input
            {...name}
            type="text"
            placeholder="enter the name for the data store" />
            {name.touched && name.error && <div>{name.error}</div>}
        </div>
        <div>
          <label>Type</label>
          <div>
            <select {...type}>
              <option value="">Select a type..</option>
              <option value="geojson">GeoJSON</option>
              <option value="gpkg">GeoPackage</option>
            </select>
            {type.touched && type.error && <div>{type.error}</div>}
          </div>
        </div>
        <div>
          <label>Version</label>
          <input
            {...version}
            type="text"
            placeholder="enter a version for the store's type" />
            {version.touched && version.error && <div>{version.error}</div>}
        </div>
      </form>
    );
  }
};

export default reduxForm({
  form: 'dataStore',
  fields,
  validate
})(DataStoreForm);
