'use strict';
import React, { Component, PropTypes } from 'react';
import { Link, browserHistory } from 'react-router';
import '../style/Triggers.less';

const format = new ol.format.GeoJSON();

class TriggerDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      creating: false
    };
  }

  createMap() {
    this.triggerSource = new ol.source.Vector();
    var triggerLayer = new ol.layer.Vector({
      source: this.triggerSource
    });
    this.select = new ol.interaction.Select({
      wrapX: false
    });
    this.map = new ol.Map({
      target: this.refs.map,
      interactions: ol.interaction.defaults().extend([this.select]),
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
        }),
        triggerLayer
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([-100, 30]),
        zoom: 3
      })
    });

    this.modify = new ol.interaction.Modify({
      features: this.select.getFeatures()
    });

    this.create = new ol.interaction.Draw({
      source: this.triggerSource,
      type: /** @type {ol.geom.GeometryType} */ ('Polygon')
    });

    this.create.on('drawstart', e => {
      this.triggerSource.clear();
    });

  }

  addTrigger(trigger) {
    let feature = format.readFeature(trigger.geojson);
    feature.setId('spatial_trigger.'+trigger.id);
    feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
    this.triggerSource.addFeature(feature);
    this.map.getView().fit(this.triggerSource.getExtent(), this.map.getSize());
  }

  componentDidMount() {
    this.createMap();
    if (this.props.trigger.geojson) {
      this.addTrigger(this.props.trigger);
    }
  }

  onEdit() {
    this.setState({ editing: true });
    this.map.addInteraction(this.modify);
  }

  onSave() {
    this.setState({ editing: false, creating: false });
    this.map.removeInteraction(this.modify);
    this.map.removeInteraction(this.create);
    let fs = this.triggerSource.getFeatures();
    if (fs.length) {
      let gj = format.writeFeature(fs[0]);
      let newTrigger = {
        ...this.props.trigger,
        geojson: gj
      };
      this.props.actions.updateTrigger(newTrigger);
    }
  }

  onCreate() {
    this.setState({ creating: true });
    this.map.addInteraction(this.create);
  }

  renderCreating() {
    if (!this.props.trigger.geojson) {
      return this.state.creating ?
        <button className="btn btn-sc" onClick={this.onSave.bind(this)}>Save</button> :
        <button className="btn btn-sc" onClick={this.onCreate.bind(this)}>Create</button>
    } else return null;
  }

  renderEditing() {
    if (this.props.trigger.geojson) {
    return this.state.editing ?
      <button className="btn btn-sc" onClick={this.onSave.bind(this)}>Save</button> :
      <button className="btn btn-sc" onClick={this.onEdit.bind(this)}>Edit</button>
    } else return null;
  }

  render() {
    const { trigger } = this.props;
    return (
      <div className="trigger-details">
        <div className="trigger-props">
          <p><strong>Name:</strong> {trigger.name}</p>
          {this.renderCreating()}
          {this.renderEditing()}
        </div>
        <div className="trigger-map" ref="map">
        </div>
      </div>
    );
  }
};

TriggerDetails.propTypes = {
  trigger: PropTypes.object.isRequired
};

export default TriggerDetails;