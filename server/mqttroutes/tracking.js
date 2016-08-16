'use strict';

var TrackingCommands = require('./../commands/tracking');

module.exports = (mqttClient,dispatcher) => {
  mqttClient.listenOnTopic('/store/tracking')
    .subscribe(
      (d) => {
        let geojson = JSON.parse(d.message.payload);
        TrackingCommands.upsertLocation(geojson);
        dispatcher.publish(TrackingCommands.CHANNEL_TRACKING_UPDATE,geojson);
      },
      (err) => console.log(err)
    );

  let setupListeners = () => {};

  return {
    name : 'device_tracking',
    setupListeners
  };
};
