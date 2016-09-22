import React, { Component } from 'react';
import * as _ from 'lodash';
import '../style/DataMap.less';

var iconStyle = new ol.style.Style({
  image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'marker-icon.png'
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
    var vectorLayer = new ol.layer.Vector({
      source: this.vectorSource
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
        vectorLayer
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
    this.map.on('click', evt => {
      var feature = this.map.forEachFeatureAtPixel(evt.pixel, f => f);
      if (feature) {
        let gj = JSON.parse(format.writeFeature(feature));
        let c = feature.getGeometry().getCoordinates();
        this.map.addOverlay(popup);
        popup.setPosition(c);
        let form_data = this.props.form_data.filter(fd => fd.id === gj.id);
        this.setState({activeFeature: form_data[0]});
      } else {
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
        feature.setId(f.id);
        feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
        feature.setStyle(iconStyle);
        return feature;
      });
    this.vectorSource.addFeatures(features);
  }
  makeFieldValue(field, value) {
    if (field.type === 'photo') {
      return <img className="img img-thumbnail" style={style.thumbnail} src={value} />;
    } else {
      return value;
    }
  }
  makePopupTable(f) {
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
  componentDidMount() {
    this.createMap();
  }
  componentWillReceiveProps(nextProps) {
    this.renderFeatures(nextProps);
  }
  render() {
    let table = this.state.activeFeature ? this.makePopupTable(this.state.activeFeature)
      : <table></table>
    return (
      <div className="map" ref="map" style={style.map}>
        <div className="popup" ref="popup" style={style.popup}>{table}</div>
      </div>
    );
  }
}

var style = {
  map: {
    flexGrow: 1
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