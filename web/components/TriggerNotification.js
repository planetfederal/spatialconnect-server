import React, { Component, PropTypes } from 'react';
import '../style/Triggers.less';

const triggerStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(255, 0, 0, 0.1)',
  }),
  stroke: new ol.style.Stroke({
    color: '#f00',
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

class TriggerNotification extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    this.createMap();
    window.addEventListener('resize', () => {
      this.createMap();
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.menu.open !== nextProps.menu.open) {
      // wait for menu to transition
      setTimeout(() => this.map.updateSize(), 200);
    }
  }

  createMap() {
    while (this.mapRef.firstChild) {
      this.mapRef.removeChild(this.mapRef.firstChild);
    }
    this.triggerSource = new ol.source.Vector();
    const triggerLayer = new ol.layer.Vector({
      source: this.triggerSource,
      style: triggerStyle,
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
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([-100, 30]),
        zoom: 3,
      }),
    });
  }

  render() {
    return (
      <div className="wrapper">
        <section className="main noPad">
          <div className="trigger-details">
            <div className="trigger-props">
              Notification to {this.props.notification.recipient}
            </div>
            <div className="trigger-map" ref={(c) => { this.mapRef = c; }} />
          </div>
        </section>
      </div>
    );
  }

}

TriggerNotification.propTypes = {
  notification: PropTypes.object.isRequired,
  menu: PropTypes.object.isRequired,
};

export default TriggerNotification;
