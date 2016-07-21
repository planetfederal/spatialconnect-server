'use strict';
import React, { Component, PropTypes } from 'react';

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
  if (values.store_type === 'wfs' && !values.uri) {
    errors.uri = 'Required';
  }
  if (values.store_type === 'wfs' && !values.default_layer) {
    errors.default_layer = 'Required';
  }
  return errors;
};

export class DataStoreForm extends Component {

  save() {
    let store = {
      name: this.refs.name.value,
      store_type: this.refs.store_type.value,
      version: this.refs.version.value,
      uri: this.refs.uri.value
    }
    if (this.refs.default_layer) {
      store.default_layer = this.refs.default_layer.value;
    }
    let errors = validate(store);
    this.props.actions.updateStoreErrors(errors);
    if(!Object.keys(errors).length) {
      this.props.onSubmit(this.props.store.id, store);
    }
  }

  shouldUpdateLayerList() {
    if (this.refs.store_type.value === 'wfs' && isUrl(this.refs.uri.value)) {
      this.props.actions.getWFSLayers(this.refs.uri.value);
    }
    if (this.refs.store_type.value !== 'wfs') {
      this.props.actions.addStoreError('default_layer', false);
      this.props.actions.updateWFSLayerList([]);
    }
  }

  componentDidMount() {
    this.shouldUpdateLayerList();
  }

  render() {
    const { store, errors, layerList } = this.props;
    return (
      <div className="side-form">
        <div className="form-group">
          <label>Name:</label>
          <input type="text" className="form-control" ref="name" defaultValue={store.name} />
          {errors.name ? <p className="text-danger">{errors.name}</p> : ''}
        </div>
        <div className="form-group">
          <label>Type:</label>
          <select className="form-control" ref="store_type"  defaultValue={store.store_type} onChange={this.shouldUpdateLayerList.bind(this)}>
            <option value="">Select a type..</option>
            <option value="geojson">GeoJSON</option>
            <option value="gpkg">GeoPackage</option>
            <option value="wfs">WFS</option>
          </select>
          {errors.store_type ? <p className="text-danger">{errors.store_type}</p> : ''}
        </div>
        <div className="form-group">
          <label>Version:</label>
          <input type="text" className="form-control" defaultValue={store.version} ref="version" />
          {errors.version ? <p className="text-danger">{errors.version}</p> : ''}
        </div>
        <div className="form-group">
          <label>URI:</label>
          <input type="text" className="form-control" ref="uri" defaultValue={store.uri} onChange={this.shouldUpdateLayerList.bind(this)}/>
          {errors.uri ? <p className="text-danger">{errors.uri}</p> : ''}
        </div>
        {this.props.layerList.length || errors.default_layer ?
          <div className="form-group">
            <label>Default Layer:</label>
            <select className="form-control" ref="default_layer"  defaultValue={store.default_layer}>
            {this.props.layerList.map(layer => (
              <option value={layer} key={layer}>{layer}</option>
            ))}
            </select>
            {errors.default_layer ? <p className="text-danger">{errors.default_layer}</p> : ''}
          </div> : ''
        }
        <div className="btn-toolbar">
          <button className="btn btn-sc" onClick={this.save.bind(this)}>Save</button>
          <button className="btn btn-default" onClick={this.props.cancel}>Cancel</button>
        </div>
      </div>
    );
  }
};

DataStoreForm.propTypes = {
  store: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  layerList: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired
};

export default DataStoreForm;
