'use strict';
import React, { Component, PropTypes } from 'react';
import { Link, browserHistory } from 'react-router';
import Dropzone from 'react-dropzone';
import { isEqual, isEmpty } from 'lodash';
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
      creating: false,
      uploading: false,
      fileUploaded: false,
      uploadErr: false,
    };
  }

  createMap() {
    while (this.refs.map.firstChild) {
      this.refs.map.removeChild(this.refs.map.firstChild);
    }
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

    if (this.props.trigger.definition) {
      this.addTrigger(this.props.trigger);
    }

  }

  addTrigger(trigger) {
    this.triggerSource.clear();
    if (isEmpty(trigger.definition)) return;
    let features = format.readFeatures(trigger.definition);
    features.forEach((feature, idx) => {
      feature.setId('spatial_trigger.'+trigger.id+'.'+idx);
      feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
      this.triggerSource.addFeature(feature);
    });
    this.map.getView().fit(this.triggerSource.getExtent(), this.map.getSize());
  }

  onEdit() {
    this.setState({ editing: true });
    this.map.addInteraction(this.modify);
    let fs = this.triggerSource.getFeatures();
    fs.forEach(f => this.select.getFeatures().push(f));
  }

  onCancel() {
    this.map.removeInteraction(this.modify);
    this.map.removeInteraction(this.create);
    this.select.getFeatures().clear();
    if (this.props.trigger.definition) {
      this.addTrigger(this.props.trigger);
    } else {
      this.triggerSource.clear();
    }
    this.setState({
      editing: false,
      creating: false,
      uploading: false,
      fileUploaded: false,
      uploadErr: false,
    });
  }

  onSave() {
    this.setState({ editing: false, creating: false, uploading: false });
    this.map.removeInteraction(this.modify);
    this.map.removeInteraction(this.create);
    this.select.getFeatures().clear();
    let fs = this.triggerSource.getFeatures();
    let gj = format.writeFeatures(fs, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    let newTrigger = {
      ...this.props.trigger,
      definition: JSON.parse(gj)
    };
    this.props.actions.updateTrigger(newTrigger);
  }

  onCreate() {
    this.setState({ creating: true });
    this.map.addInteraction(this.create);
  }

  onUpload() {
    this.setState({ uploading: true });
  }

  onDrop(acceptedFiles, rejectedFiles) {
    if (acceptedFiles.length) {
      let file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = e => {
        try {
          let gj = JSON.parse(e.target.result);
          this.setState({ uploadErr: false });
          let newTrigger = {
            ...this.props.trigger,
            definition: gj
          };
          this.addTrigger(newTrigger);
          this.setState({ fileUploaded: true });
        } catch (err) {
          this.setState({ uploadErr: 'Not valid GeoJSON' });
        }
      };
      reader.readAsText(file);
    }
  }

  onDelete() {
    this.props.actions.deleteTrigger(this.props.trigger);
  }

  componentDidMount() {
    this.createMap();
    window.addEventListener("resize", () => {
      this.createMap();
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.trigger.definition, this.props.trigger.definition)) {
      this.addTrigger(nextProps.trigger);
    }
    if (this.props.menu.open !== nextProps.menu.open) {
      //wait for menu to transition
      setTimeout(() => this.map.updateSize(), 200);
    }
  }

  renderCreating() {
    if (!this.props.trigger.definition && !this.state.uploading) {
      return this.state.creating ?
      <div className="btn-toolbar">
        <button className="btn btn-sc" onClick={this.onSave.bind(this)}>Save</button>
        <button className="btn btn-default" onClick={this.onCancel.bind(this)}>Cancel</button>
      </div> : <div>
      <div className="btn-toolbar">
        <button className="btn btn-sc" onClick={this.onCreate.bind(this)}>Draw</button>
        <button className="btn btn-sc" onClick={this.onUpload.bind(this)}>Upload</button>
      </div>
      <div className="btn-toolbar">
        <button className="btn btn-danger" onClick={this.onDelete.bind(this)}>Delete</button>
      </div></div>
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

  renderUploading() {
    return !!this.state.uploading &&
      <div>
        {!this.state.fileUploaded &&
          <Dropzone onDrop={this.onDrop.bind(this)} multiple={false}
            className="drop-zone" activeClassName="drop-zone-active">
            <div>Drop file here, or click to select file to upload.</div>
          </Dropzone>
        }
        {!!this.state.uploadErr &&
          <p>{this.state.uploadErr}</p>
        }
        <div className="btn-toolbar">
          <button className="btn btn-sc" onClick={this.onSave.bind(this)}>Save</button>
          <button className="btn btn-default" onClick={this.onCancel.bind(this)}>Cancel</button>
        </div>
      </div>
  }

  render() {
    const { trigger } = this.props;
    return (
      <div className="trigger-details">
        <div className="trigger-props">
          <TriggerItem trigger={this.props.trigger} />
          {this.renderCreating()}
          {this.renderUploading()}
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