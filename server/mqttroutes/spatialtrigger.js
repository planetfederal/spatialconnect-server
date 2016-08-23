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
            -122.04248428344727,
            37.33263104074124
          ],
          [
            -122.04248428344727,
            37.33774934661962
          ],
          [
            -122.03553199768068,
            37.33774934661962
          ],
          [
            -122.03553199768068,
            37.33263104074124
          ],
          [
            -122.04248428344727,
            37.33263104074124
          ]
        ]
      ]
    }
  };

module.exports = (mqttClient,dispatcher) => {

  let checkGeoFence = pt => {
    var isIn = inside(pt,geofence);
    //console.log('Is it in? '+isIn);
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
