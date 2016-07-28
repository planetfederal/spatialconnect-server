'use strict';

var SCMessage = require('./../SCMessage');
var models = require('./../models/');
var Rx = require('rx');

module.exports = (mqttClient) => {
  mqttClient.listenOnTopic('/store/tracking')
    .map((d) => {
      return SCMessage.decode(d.message);
    }).subscribe(
      (d) => {
        let geojson = JSON.parse(d.payload);
        models.Devices.findByIdentifier(models,geojson.metadata.client)
          .flatMap((c) => {
            console.log(c);
            console.log('id:'+c.id);
            return Rx.Observable.fromPromise(models.DeviceLocations.create({
              x : geojson.geometry.coordinates[0],
              y : geojson.geometry.coordinates[1],
              device_id : c.id
            }));
          }).subscribe(
            () => {},
            (err) => console.log(err),
            () => console.log('Location Saved')
          );
      },
      (err) => console.log(err)
    );

  return {
    name : 'device_tracking'
  };
};
