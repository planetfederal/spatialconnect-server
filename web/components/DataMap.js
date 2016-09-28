import React, { Component } from 'react';
import * as _ from 'lodash';
import '../style/DataMap.less';
import moment from 'moment';

var iconStyle = new ol.style.Style({
  image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'marker-icon.png'
  }))
});

var deviceStyle = new ol.style.Style({
  image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
    anchor: [0.5, 20],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'mobile.png',
    size: [41, 41]
  }))
});

var format = new ol.format.GeoJSON();

class DataMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeFeature: false
    };
  }
  createMap() {
    this.vectorSource = new ol.source.Vector();
    this.deviceLocationsSource = new ol.source.Vector();
    this.spatialTriggersSource = new ol.source.Vector();
    var vectorLayer = new ol.layer.Vector({
      source: this.vectorSource
    });
    var deviceLocationsLayer = new ol.layer.Vector({
      source: this.deviceLocationsSource
    });
    var spatialTriggersLayer = new ol.layer.Vector({
      source: this.spatialTriggersSource
    });
    this.map = new ol.Map({
      target: this.refs.map,
      layers: [
        new ol.layer.Tile({
          extent: [-20237886, -14945274, 20237886, 20211553.9],
          source: new ol.source.TileWMS({
            url: 'http://tiles.boundlessgeo.com/wms',
            params: {'LAYERS': 'openstreetmap:osm', 'TILED': true, srs: 'EPSG:900913', FORMAT: 'image/png8', VERSION: '1.1.0', TRANSPARENT: 'false'}

          })
        }),
        vectorLayer,
        deviceLocationsLayer,
        spatialTriggersLayer
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([-100, 30]),
        zoom: 3
      })
    });
    var popup = new ol.Overlay({
      element: this.refs.popup,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -50]
    });
    let selectInteraction = new ol.interaction.Select({
      layers: [vectorLayer, deviceLocationsLayer]
    });
    this.map.addInteraction(selectInteraction);
    selectInteraction.on('select', e => {
      if (e.selected.length) {
        let feature = e.selected[0];
        let gj = JSON.parse(format.writeFeature(feature));
        let c = feature.getGeometry().getCoordinates();
        this.map.addOverlay(popup);
        popup.setPosition(c);
        if (gj.id.indexOf('form_submission') > -1) {
          let data = this.props.form_data.filter(fd => fd.id === +gj.id.replace('form_submission.', ''));
          this.setState({activeFeature: data[0]});
        }
        if (gj.id.indexOf('device_location') > -1) {
          let data = this.props.device_locations.filter(fd => fd.id === +gj.id.replace('device_location.', ''));
          this.setState({deviceLocationActive: data[0]});
        }
      } else {
        this.setState({
          activeFeature: false,
          deviceLocationActive: false
        });
        this.map.removeOverlay(popup);
      }
    });
    this.map.on('pointermove', evt => {
      var pixel = this.map.getEventPixel(evt.originalEvent);
      var hit = this.map.hasFeatureAtPixel(pixel);
      this.map.getTarget().style.cursor = hit ? 'pointer' : '';
    });
  }
  renderFeatures(props) {
    this.vectorSource.clear();
    let features = props.form_data
      .filter(f => f.val.geometry)
      .filter(f => {
        return props.form_ids.indexOf(f.form_id) >= 0
      }).map(f => {
        let feature = format.readFeature(f.val);
        feature.setId('form_submission.'+f.id);
        feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
        feature.setStyle(iconStyle);
        return feature;
      });
    this.vectorSource.addFeatures(features);

    this.deviceLocationsSource.clear();
    if (props.device_locations_on) {
      let deviceLocationFeatures = props.device_locations
        .map(f => {
          let feature = format.readFeature(f);
          feature.setId('device_location.'+f.id);
          feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
          feature.setStyle(deviceStyle);
          return feature;
        });
      this.deviceLocationsSource.addFeatures(deviceLocationFeatures);
    }

    this.spatialTriggersSource.clear();
    if (props.spatial_triggers_on) {
      let spatialTriggerFeatures = props.spatial_triggers
        .map(t => {
          let gj = t.geojson;
          gj.id = t.id;
          return gj;
        })
        .map(f => {
          let feature = format.readFeature(f);
          feature.setId('spatial_trigger.'+f.id);
          feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
          //feature.setStyle(deviceStyle);
          return feature;
        });
      this.spatialTriggersSource.addFeatures(spatialTriggerFeatures);
    }
  }
  makeFieldValue(field, value) {
    if (field.type === 'photo') {
      return <img className="img img-thumbnail" style={style.thumbnail} src={value} />;
    } else {
      return value;
    }
  }
  makePopupTableFormSubmission(f) {
    const form = this.props.forms[f.form_id];
    let rows = form.fields.map(field => {
      let value = field.type === 'photo'
      return (<tr key={field.field_key}>
        <td className="form-label">{field.field_label}</td>
        <td>{this.makeFieldValue(field, f.val.properties[field.field_key])}</td>
      </tr>);
    });
    let table = <div>
      <p className="form-label">{form.form_label}</p>
      <p className="form-note">{f.val.metadata.created_at}</p>
      <table className="table table-bordered table-striped"><tbody>{rows}</tbody></table>
    </div>;
    return table;
  }
  makePopupTableDeviceLocation(f) {
    let table = <div>
      <p className="form-label">Device Location</p>
      <table className="table table-bordered table-striped"><tbody>
        <tr><td>Identifier:</td><td>{f.metadata.identifier}</td></tr>
        {typeof f.metadata.device_info === 'string' ?
          <tr><td>Device Info:</td><td>{f.metadata.device_info}</td></tr> : null}
        {typeof f.metadata.device_info.os === 'string' ?
          <tr><td>OS:</td><td>{f.metadata.device_info.os}</td></tr> : null}
        {typeof f.metadata.updated_at === 'string' ?
          <tr><td>Time Recorded:</td><td>{moment(f.metadata.updated_at).format("dddd, MMMM Do YYYY, h:mm:ss a")}</td></tr> : null}
      </tbody></table>
    </div>;
    return table;
  }
  componentDidMount() {
    this.createMap();
  }
  componentWillReceiveProps(nextProps) {
    this.renderFeatures(nextProps);
  }
  render() {
    let table;
    if (this.state.activeFeature) {
      table = this.makePopupTableFormSubmission(this.state.activeFeature);
    } else if (this.state.deviceLocationActive) {
      table = this.makePopupTableDeviceLocation(this.state.deviceLocationActive)
    } else {
      table = <table></table>;
    }
    return (
      <div className="map" ref="map" style={style.map}>
        <div className="popup" ref="popup" style={style.popup}>{table}</div>
      </div>
    );
  }
}

var style = {
  map: {
    flex: 1
  },
  popup: {
    background: 'white',
    padding: 10,
    borderWidth: 2,
    borderRadius: 3,
    borderColor: '#333'
  },
  thumbnail: {
    height: 100,
  },
}

export default DataMap;