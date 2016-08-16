'use strict';

var SCMessage = require('./../SCMessage');
var TrackingCommands = require('./../commands/tracking');

module.exports = (mqttClient,dispatcher) => {
  mqttClient.listenOnTopic('/store/tracking')
    .map((d) => {
      return SCMessage.decode(d.message);
    }).subscribe(
      (d) => {
        let geojson = JSON.parse(d.payload);
        TrackingCommands.upsertLocation(geojson);
      },
      (err) => console.log(err)
    );

  let setupListeners = () => {

  };
  return {
    name : 'device_tracking',
    setupListeners
  };
};
