'use strict';
import React, { Component, PropTypes } from 'react';
import { Link, browserHistory } from 'react-router';
import { isEqual } from 'lodash';
import TriggerItem from './TriggerItem';
import '../style/Triggers.less';

const format = new ol.format.GeoJSON();

const triggerStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(255, 0, 0, 0.1)'
  }),
  stroke: new ol.style.Stroke({
    color: '#f00',
    width: 1
  })
});

const triggerStyleSelected = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(255, 0, 0, 0.2)'
  }),
  stroke: new ol.style.Stroke({
    color: '#f00',
    width: 2
  })
});

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
      source: this.triggerSource,
      style: triggerStyle
    });
    this.select = new ol.interaction.Select({
      wrapX: false,
      style: triggerStyleSelected
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
    this.triggerSource.clear();
    let feature = format.readFeature(trigger.definition);
    feature.setId('spatial_trigger.'+trigger.id);
    feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
    this.triggerSource.addFeature(feature);
    this.select.getFeatures().clear();
    this.select.getFeatures().push(feature);
    this.map.getView().fit(this.triggerSource.getExtent(), this.map.getSize());
  }

  onEdit() {
    this.setState({ editing: true });
    this.map.addInteraction(this.modify);
  }

  onCancel() {
    this.map.removeInteraction(this.modify);
    this.map.removeInteraction(this.create);
    if (this.props.trigger.definition) {
      this.addTrigger(this.props.trigger);
    } else {
      this.triggerSource.clear();
    }
    this.setState({ editing: false, creating: false });
  }

  onSave() {
    this.setState({ editing: false, creating: false });
    this.map.removeInteraction(this.modify);
    this.map.removeInteraction(this.create);
    let fs = this.triggerSource.getFeatures();
    if (fs.length) {
      let f = fs[0];
      f.getGeometry().transform('EPSG:3857', 'EPSG:4326');
      let gj = JSON.parse(format.writeFeature(f));
      let newTrigger = {
        ...this.props.trigger,
        definition: gj
      };
      this.props.actions.updateTrigger(newTrigger);
    }
  }

  onCreate() {
    this.setState({ creating: true });
    this.map.addInteraction(this.create);
  }

  onDelete() {
    this.props.actions.deleteTrigger(this.props.trigger);
  }

  componentDidMount() {
    this.createMap();
    if (this.props.trigger.definition) {
      this.addTrigger(this.props.trigger);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.trigger.definition, this.props.trigger.definition)) {
      this.addTrigger(nextProps.trigger);
    }
  }

  renderCreating() {
    if (!this.props.trigger.definition) {
      return this.state.creating ?
      <div className="btn-toolbar">
        <button className="btn btn-sc" onClick={this.onSave.bind(this)}>Save</button>
        <button className="btn btn-default" onClick={this.onCancel.bind(this)}>Cancel</button>
      </div> :
      <div className="btn-toolbar">
        <button className="btn btn-sc" onClick={this.onCreate.bind(this)}>Draw</button>
        <button className="btn btn-danger" onClick={this.onDelete.bind(this)}>Delete</button>
      </div>
    } else return null;
  }

  renderEditing() {
    if (this.props.trigger.definition) {
    return this.state.editing ?
      <div className="btn-toolbar">
        <button className="btn btn-sc" onClick={this.onSave.bind(this)}>Save</button>
        <button className="btn btn-default" onClick={this.onCancel.bind(this)}>Cancel</button>
      </div> :
      <div className="btn-toolbar">
        <button className="btn btn-sc" onClick={this.onEdit.bind(this)}>Edit</button>
        <button className="btn btn-danger" onClick={this.onDelete.bind(this)}>Delete</button>
      </div>
    } else return null;
  }

  render() {
    const { trigger } = this.props;
    return (
      <div className="trigger-details">
        <div className="trigger-props">
          <TriggerItem trigger={this.props.trigger} />
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