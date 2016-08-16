'use strict';

var TrackingCommands = require('./../commands/tracking');
var NotifyCommands = require('./../commands/notify');
var inside = require('turf-inside');
var geofence =
  {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'Polygon',
      'coordinates': [
        [
          [
            -122.48803138732912,
            37.66629332796101
          ],
          [
            -122.48803138732912,
            37.70195437267711
          ],
          [
            -122.43945121765137,
            37.70195437267711
          ],
          [
            -122.43945121765137,
            37.66629332796101
          ],
          [
            -122.48803138732912,
            37.66629332796101
          ]
        ]
      ]
    }
  };

module.exports = (mqttClient,dispatcher) => {

  let checkGeoFence = pt => {
    var isIn = inside(pt,geofence);
    console.log('Is it in? '+isIn);
    if (isIn) {
      console.log('Pushing to Notify Channel');
      dispatcher.publish(NotifyCommands.CHANNEL_NOTIFY_INFO,'Point is in Polygon');
    }
  };

  let setupListeners = () => {
    dispatcher.subscribe(TrackingCommands.CHANNEL_TRACKING_UPDATE,checkGeoFence);
  };

  return {
    name : 'spatialtrigger',
    setupListeners
  };
};
