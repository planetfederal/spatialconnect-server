'use strict';

var models = require('./../models/');
var Rx = require('rx');

module.exports = (() => {
  return {
    CHANNEL_TRACKING_UPDATE : '@@channel/tracking_update',
    upsertLocation : (geojson) => {
      models.Devices.findByIdentifier(models,geojson.metadata.client)
      .flatMap((c) => {
        return Rx.Observable.fromPromise(models.DeviceLocations.create({
          x : geojson.geometry.coordinates[0],
          y : geojson.geometry.coordinates[1],
          device_id : c.id
        }));
      }).subscribe(
        () => {},
        (err) => console.log(err)
      );
    }
  };
})();
