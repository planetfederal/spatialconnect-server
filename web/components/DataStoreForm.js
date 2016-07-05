'use strict';
import React, { Component, PropTypes } from 'react';
import '../style/DataStore.less';

const fields = ['id', 'storeId', 'name', 'type', 'version']

const isUrl = (s) => {
   var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
   return regexp.test(s);
}

export const validate = values => {
  const errors = {};

  if (!values.name) {
    errors.name = 'Required';
  }
  if (!values.store_type) {
    errors.store_type = 'Required';
  }
  if (!values.version) {
    errors.version = 'Required';
  }
  if(values.uri && !isUrl(values.uri)) {
    errors.uri = 'Must be valid uri';
  }

  return errors;
};

export class DataStoreForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      errors: {}
    };
  }

  save() {
    let store = {
      name: this.refs.name.value,
      store_type: this.refs.store_type.value,
      version: this.refs.version.value,
      uri: this.refs.uri.value
    }
    let errors = validate(store);
    this.setState({ errors: errors });
    if(!Object.keys(errors).length) {
      this.props.onSubmit(this.props.store.id, store);
    }
  }

  cancel() {
    this.props.cancel();
  }

  render() {
    let store = this.props.store;
    return (
      <div className="store-form">
        <div className="form-group">
          <label>Name:</label>
          <input type="text" className="form-control" ref="name" defaultValue={store.name} />
          {this.state.errors.name ? <p className="text-danger">{this.state.errors.name}</p> : ''}
        </div>
        <div className="form-group">
          <label>Type:</label>
          <select className="form-control" ref="store_type"  defaultValue={store.store_type}>
            <option value="">Select a type..</option>
            <option value="geojson">GeoJSON</option>
            <option value="gpkg">GeoPackage</option>
            <option value="wfs">WFS</option>
          </select>
          {this.state.errors.store_type ? <p className="text-danger">{this.state.errors.store_type}</p> : ''}
        </div>
        <div className="form-group">
          <label>Version:</label>
          <input type="text" className="form-control" defaultValue={store.version} ref="version" />
          {this.state.errors.version ? <p className="text-danger">{this.state.errors.version}</p> : ''}
        </div>
        <div className="form-group">
          <label>URI:</label>
          <input type="text" className="form-control" ref="uri" defaultValue={store.uri} />
          {this.state.errors.uri ? <p className="text-danger">{this.state.errors.uri}</p> : ''}
        </div>
        <div className="btn-toolbar">
          <button className="btn btn-sc" onClick={this.save.bind(this)}>Save</button>
          <button className="btn btn-sc" onClick={this.cancel.bind(this)}>Cancel</button>
        </div>
      </div>
    );
  }
};

DataStoreForm.propTypes = {
  store: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired
};

export default DataStoreForm;
