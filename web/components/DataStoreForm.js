'use strict';
import React, { Component, PropTypes } from 'react';
import { isUrl } from '../utils';

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
  if(!values.uri) {
    errors.uri = 'Must be valid uri';
  }
  if (values.store_type === 'wfs' && !values.uri) {
    errors.uri = 'Required';
  }
  if (values.store_type === 'wfs' && !values.default_layers.length) {
    errors.default_layers = 'Must choose at least one default layer.';
  }
  if (values.options && values.options.polling) {
    let msg = 'Must be a number of seconds between 1 and 600';
    let p = parseFloat(values.options.polling);
    if (!isNaN(p) && isFinite(values.options.polling)) {
      if (p % 1 !== 0 || p < 1 || p > 600) {
        errors.polling = msg;
      }
    } else {
      errors.polling = msg;
    }
  }
  return errors;
};

export class DataStoreForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      store_type: null,
      default_layers: props.store.default_layers || false,
      polling: props.store.options && props.store.options.polling ? props.store.options.polling : null,
      show_polling: props.store.store_type === 'geojson' || props.store.store_type === 'wfs',
    };
  }

  save() {
    let store = {
      name: this.refs.name.value,
      store_type: this.refs.store_type.value,
      version: this.refs.version.value.trim(),
      uri: this.refs.uri.value.trim(),
    }
    if (this.refs.default_layers) {
      store.default_layers = this.getChosenLayers();
    }
    if (this.refs.polling) {
      store.options = {
        polling: this.refs.polling.value.trim(),
      };
    }
    let errors = validate(store);
    this.props.actions.updateStoreErrors(errors);
    if(!Object.keys(errors).length) {
      this.props.onSubmit(this.props.store.id, store);
    }
  }

  onStoreTypeChange() {
    this.setState({store_type: this.refs.store_type.value});
    this.shouldUpdateLayerList();
    this.addPollingOption();
  }

  addPollingOption() {
    this.setState({
      show_polling: (this.refs.store_type.value === 'geojson' || this.refs.store_type.value === 'wfs')
    });
  }

  shouldUpdateLayerList() {
    if (this.refs.store_type.value === 'wfs') {
      if (isUrl(this.refs.uri.value)) {
        this.props.actions.addStoreError('default_layers', 'Loading layers...');
        this.props.actions.getWFSLayers(this.refs.uri.value);
      } else {
        this.props.actions.addStoreError('default_layers', 'Enter a URI to load layer list.');
      }
    }
    if (this.refs.store_type.value !== 'wfs') {
      this.props.actions.addStoreError('default_layers', false);
      this.props.actions.updateWFSLayerList([]);
    }
  }

  getChosenLayers() {
    let options = Array.from(this.refs.default_layers.options);
    return options
      .filter(option => option.selected)
      .map(option => option.value);
  }

  onLayersChange() {
    this.setState({default_layers: this.getChosenLayers()});
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
          <select className="form-control" ref="store_type"  defaultValue={store.store_type} onChange={this.onStoreTypeChange.bind(this)}>
            <option value="">Select a type..</option>
            <option value="geojson">GeoJSON</option>
            <option value="gpkg">GeoPackage</option>
            <option value="wfs">WFS</option>
          </select>
          {errors.store_type ? <p className="text-danger">{errors.store_type}</p> : ''}
        </div>
        <div className="form-group">
          <label>Version:</label>
          <input type="text" className="form-control" defaultValue={store.version} ref="version" maxLength={15} />
          {errors.version ? <p className="text-danger">{errors.version}</p> : ''}
        </div>
        <div className="form-group">
          <label>URI:</label>
          <input type="text" className="form-control" ref="uri" defaultValue={store.uri} onChange={this.shouldUpdateLayerList.bind(this)}/>
          {errors.uri ? <p className="text-danger">{errors.uri}</p> : ''}
        </div>
        {store.store_type === 'wfs' || this.state.store_type === 'wfs' ?
          <div className="form-group">
            <label>Default Layers:</label>
            <select multiple={true} className="form-control default_layers" ref="default_layers"  value={this.state.default_layers}
              onChange={this.onLayersChange.bind(this)}>
            {this.props.layerList.map((layer, i) => (
              <option value={layer} key={layer+i}>{layer}</option>
            ))}
            </select>
            {errors.default_layers ? <p className="text-danger">{errors.default_layers}</p> : ''}
          </div> : ''
        }
        {this.state.show_polling ?
          <div className="form-group">
            <label>Polling:</label>
            <p className="help-block">Number of seconds (0 - 600)</p>
            <input type="text" className="form-control" defaultValue={this.state.polling} ref="polling" maxLength={5} />
            {errors.polling ? <p className="text-danger">{errors.polling}</p> : ''}
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
