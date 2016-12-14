import React, { Component, PropTypes } from 'react';
import Dropzone from 'react-dropzone';
import { isEqual, isEmpty } from 'lodash';
import TriggerItem from './TriggerItem';
import '../style/Triggers.less';

const format = new ol.format.GeoJSON();

const triggerStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(255, 0, 0, 0.1)',
  }),
  stroke: new ol.style.Stroke({
    color: '#f00',
    width: 1,
  }),
});

const newRuleStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(0, 0, 255, 0.1)',
  }),
  stroke: new ol.style.Stroke({
    color: '#00f',
    width: 1,
  }),
});

const triggerStyleSelected = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(255, 0, 0, 0.2)',
  }),
  stroke: new ol.style.Stroke({
    color: '#f00',
    width: 2,
  }),
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

    this.onSave = this.onSave.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onDone = this.onDone.bind(this);
    this.onDraw = this.onDraw.bind(this);
    this.onUpload = this.onUpload.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onAddRule = this.onAddRule.bind(this);
    this.onRuleComparatorChange = this.onRuleComparatorChange.bind(this);
  }

  componentDidMount() {
    this.createMap();
    window.addEventListener('resize', () => {
      this.createMap();
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.trigger.rules, this.props.trigger.rules)) {
      this.triggerSource.clear();
      this.addRules(nextProps.trigger);
    }
    if (this.props.menu.open !== nextProps.menu.open) {
      // wait for menu to transition
      setTimeout(() => this.map.updateSize(), 200);
    }
  }

  onEdit() {
    this.setState({ editing: true });
    this.map.addInteraction(this.modify);
    const fs = this.triggerSource.getFeatures();
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
    const fcId = `${this.props.trigger.id}.${this.props.trigger.rules.length + 1}`;
    const fs = this.newRuleSource.getFeatures().map((f, i) => {
      f.setId(`${fcId}.${i}`);
      return f;
    });
    const gj = JSON.parse(format.writeFeatures(fs, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    }));
    gj.id = fcId;
    const newRule = {
      lhs: ['geometry'],
      comparator: this.state.rule_comparator,
      rhs: gj,
    };
    const newTrigger = {
      ...this.props.trigger,
      rules: this.props.trigger.rules ? this.props.trigger.rules.concat(newRule) : [newRule],
    };
    this.newRuleSource.clear();
    this.props.actions.updateTrigger(newTrigger);
  }

  onDone() {
    this.setState({ drawing: false, uploading: false });
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

  onDrop(acceptedFiles) {
    if (acceptedFiles.length) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const gj = JSON.parse(e.target.result);
          this.setState({ uploadErr: false });
          const features = format.readFeatures(gj);
          features.forEach((feature) => {
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
      rule_comparator: e.target.value,
    });
  }

  onAddRule() {
    this.setState({ creating: true });
  }

  createMap() {
    while (this.mapRef.firstChild) {
      this.mapRef.removeChild(this.mapRef.firstChild);
    }
    this.triggerSource = new ol.source.Vector();
    this.newRuleSource = new ol.source.Vector();
    const triggerLayer = new ol.layer.Vector({
      source: this.triggerSource,
      style: triggerStyle,
    });
    const newRuleLayer = new ol.layer.Vector({
      source: this.newRuleSource,
      style: newRuleStyle,
    });
    this.select = new ol.interaction.Select({
      wrapX: false,
      style: triggerStyleSelected,
    });
    this.map = new ol.Map({
      target: this.mapRef,
      interactions: ol.interaction.defaults().extend([this.select]),
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
        }),
        triggerLayer,
        newRuleLayer,
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([-100, 30]),
        zoom: 3,
      }),
    });

    this.modify = new ol.interaction.Modify({
      features: this.select.getFeatures(),
    });

    this.create = new ol.interaction.Draw({
      source: this.newRuleSource,
      type: /** @type {ol.geom.GeometryType} */ ('Polygon'),
    });
    this.addRules(this.props.trigger);
  }

  addRules(trigger) {
    if (trigger.rules) {
      trigger.rules.forEach((rule) => {
        if (rule.comparator === '$geowithin') {
          this.addTrigger(rule);
        }
      });
    }
  }

  addTrigger(rule) {
    if (isEmpty(rule.rhs)) return;
    const features = format.readFeatures(rule.rhs);
    features.forEach((feature) => {
      feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
      this.triggerSource.addFeature(feature);
    });
    this.map.getView().fit(this.triggerSource.getExtent(), this.map.getSize());
  }

  renderEditing() {
    return !this.state.editing && !this.state.creating ?
      <div>
        <div className="btn-toolbar">
          <button className="btn btn-sc" onClick={this.onAddRule}>Add Rule</button>
          <button className="btn btn-danger" onClick={this.onDelete}>Delete</button>
        </div>
      </div> : null;
  }

  renderCreating() {
    if (this.state.creating) {
      if (this.state.drawing) {
        return (<div className="btn-toolbar">
          <button className="btn btn-sc" onClick={this.onDone}>Done Drawing</button>
          <button className="btn btn-default" onClick={this.onCancel}>Cancel</button>
        </div>);
      }
      if (this.state.uploading) {
        return (<div>
          <Dropzone
            onDrop={this.onDrop} multiple={false}
            className="drop-zone" activeClassName="drop-zone-active"
          >
            <div>Drop file here, or click to select file to upload.</div>
          </Dropzone>
          {!!this.state.uploadErr &&
            <p>{this.state.uploadErr}</p>
          }
          <div className="btn-toolbar">
            <button className="btn btn-sc" onClick={this.onCancel}>Cancel</button>
          </div>
        </div>);
      }
      if (!this.state.drawing && !this.state.uploading) {
        return (<div>
          <div className="form-group">
            <label htmlFor="comparator" >Rule Type:</label>
            <select
              id="comparator" className="form-control"
              value={this.state.rule_comparator}
              onChange={this.onRuleComparatorChange}
            >
              <option value="$geowithin">geowithin</option>
            </select>
          </div>
          <div className="btn-toolbar">
            <button className="btn btn-sc" onClick={this.onDraw}>Draw</button>
            <button className="btn btn-sc" onClick={this.onUpload}>Upload</button>
          </div>
          <div className="btn-toolbar">
            <button className="btn btn-sc" onClick={this.onSave}>Save</button>
            <button className="btn btn-sc" onClick={this.onCancel}>Cancel</button>
          </div>
        </div>);
      }
    }
    return null;
  }

  render() {
    const { trigger } = this.props;
    return (
      <div className="trigger-details">
        <div className="trigger-props">
          <TriggerItem trigger={trigger} />
          {this.renderEditing()}
          {this.renderCreating()}
        </div>
        <div className="trigger-map" ref={(c) => { this.mapRef = c; }} />
      </div>
    );
  }
}

TriggerDetails.propTypes = {
  trigger: PropTypes.object.isRequired,
  menu: PropTypes.object.isRequired,
  actions: PropTypes.object.isRquired,
};

export default TriggerDetails;
