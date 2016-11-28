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

const newRuleStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(0, 0, 255, 0.1)'
  }),
  stroke: new ol.style.Stroke({
    color: '#00f',
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
      addingRule: false,
      editing: false,
      creating: false,
      drawing: false,
      uploading: false,
      fileUploaded: false,
      uploadErr: false,
      rule_comparator: '$geowithin',
    };
  }

  createMap() {
    while (this.refs.map.firstChild) {
      this.refs.map.removeChild(this.refs.map.firstChild);
    }
    this.triggerSource = new ol.source.Vector();
    this.newRuleSource = new ol.source.Vector();
    var triggerLayer = new ol.layer.Vector({
      source: this.triggerSource,
      style: triggerStyle
    });
    var newRuleLayer = new ol.layer.Vector({
      source: this.newRuleSource,
      style: newRuleStyle
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
        triggerLayer,
        newRuleLayer
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
      source: this.newRuleSource,
      type: /** @type {ol.geom.GeometryType} */ ('Polygon')
    });
    this.addRules(this.props.trigger);
  }

  addRules(trigger) {
    if (trigger.rules) {
      trigger.rules.forEach(rule => {
        if (rule.comparator === '$geowithin') {
          this.addTrigger(rule);
        }
      });
    }
  }

  addTrigger(rule) {
    console.log('rule', rule);
    //this.triggerSource.clear();
    if (isEmpty(rule.rhs)) return;
    let features = format.readFeatures(rule.rhs);
    features.forEach((feature, idx) => {
      //feature.setId('spatial_trigger.'+trigger.id+'.'+idx);
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
    this.newRuleSource.clear();
    this.setState({
      editing: false,
      creating: false,
      drawing: false,
      uploading: false,
      fileUploaded: false,
      uploadErr: false,
    });
  }

  onSave() {
    this.setState({ editing: false, creating: false, drawing: false, uploading: false });
    this.map.removeInteraction(this.modify);
    this.map.removeInteraction(this.create);
    this.select.getFeatures().clear();
    let fs = this.newRuleSource.getFeatures();
    let gj = format.writeFeatures(fs, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    let new_rule = {
      lhs: 'geometry',
      comparator: this.state.rule_comparator,
      rhs: JSON.parse(gj)
    }
    let newTrigger = {
      ...this.props.trigger,
      rules: this.props.trigger.rules ? this.props.trigger.rules.concat(new_rule) : [new_rule]
    };
    this.newRuleSource.clear();
    this.props.actions.updateTrigger(newTrigger);
  }

  onDone() {
    this.setState({drawing: false, uploading: false });
    this.map.removeInteraction(this.modify);
    this.map.removeInteraction(this.create);
    this.select.getFeatures().clear();
  }

  onDraw() {
    this.setState({ drawing: true });
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
          let new_rule = {
            lhs: 'geometry',
            comparator: this.state.rule_comparator,
            rhs: gj
          };
          let features = format.readFeatures(gj);
          features.forEach((feature, idx) => {
            feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
            this.newRuleSource.addFeature(feature);
          });
          this.map.getView().fit(this.newRuleSource.getExtent(), this.map.getSize());
          this.setState({ uploading: false });
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

  onRuleComparatorChange(e) {
    this.setState({
      rule_comparator: e.target.value
    });
  }

  addRule() {
    this.setState({ creating: true });
  }

  componentDidMount() {
    this.createMap();
    window.addEventListener("resize", () => {
      this.createMap();
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.trigger.rules, this.props.trigger.rules)) {
      this.triggerSource.clear();
      this.addRules(nextProps.trigger);
    }
    if (this.props.menu.open !== nextProps.menu.open) {
      //wait for menu to transition
      setTimeout(() => this.map.updateSize(), 200);
    }
  }

  renderEditing() {
    return !this.state.editing && !this.state.creating ?
    <div>
      <div className="btn-toolbar">
        <button className="btn btn-sc" onClick={this.addRule.bind(this)}>Add Rule</button>
        <button className="btn btn-danger" onClick={this.onDelete.bind(this)}>Delete</button>
      </div>
    </div> : null;
  }

  renderCreating() {
    if (this.state.creating) {
      if (this.state.drawing) {
        return <div className="btn-toolbar">
        <button className="btn btn-sc" onClick={this.onDone.bind(this)}>Done Drawing</button>
        <button className="btn btn-default" onClick={this.onCancel.bind(this)}>Cancel</button>
      </div>
      }
      if (this.state.uploading) {
        return <div>
            <Dropzone onDrop={this.onDrop.bind(this)} multiple={false}
              className="drop-zone" activeClassName="drop-zone-active">
              <div>Drop file here, or click to select file to upload.</div>
            </Dropzone>
          {!!this.state.uploadErr &&
            <p>{this.state.uploadErr}</p>
          }
          <div className="btn-toolbar">
            <button className="btn btn-sc" onClick={this.onCancel.bind(this)}>Cancel</button>
          </div>
        </div>
      }
      if (!this.state.drawing && !this.state.uploading) {
        return <div>
        <div className="form-group">
          <label>Rule Type:</label>
          <select className="form-control" ref="comparator" defaultValue={this.state.rule_comparator}
            onChange={this.onRuleComparatorChange.bind(this)}>
            <option value="$geowithin">geowithin</option>
          </select>
        </div>
          <div className="btn-toolbar">
            <button className="btn btn-sc" onClick={this.onDraw.bind(this)}>Draw</button>
            <button className="btn btn-sc" onClick={this.onUpload.bind(this)}>Upload</button>
          </div>
          <div className="btn-toolbar">
            <button className="btn btn-sc" onClick={this.onSave.bind(this)}>Save</button>
            <button className="btn btn-sc" onClick={this.onCancel.bind(this)}>Cancel</button>
          </div>
        </div>;
      }

    } else return null;
  }

  render() {
    const { trigger } = this.props;
    return (
      <div className="trigger-details">
        <div className="trigger-props">
          <TriggerItem trigger={this.props.trigger} />
          {this.renderEditing()}
          {this.renderCreating()}
        </div>
        <div className="trigger-map" ref="map"></div>
      </div>
    );
  }
};

TriggerDetails.propTypes = {
  trigger: PropTypes.object.isRequired
};

export default TriggerDetails;