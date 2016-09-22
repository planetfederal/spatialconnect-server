'use strict';

var models = require('./../models/');
var Rx = require('rx');
var _ = require('lodash');

const tKeys = ['created_at','updated_at','deleted_at'];

var filterStampsAndNulls = (ff) => {
  return _.chain(ff.dataValues)
    .omit(tKeys)
    .omitBy(_.isNull)
    .value();
};

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
        err => console.log(err)
      );
    },
    locations : () => {
      return Rx.Observable.fromPromise(models.DeviceLocations.findAll(
      )).flatMap(Rx.Observable.fromArray).flatMap(l => {
        return Rx.Observable.create(obs => {
          models.Devices.findById(l.device_id)
            .then(d => {
              if (d === null) {
                obs.onCompleted();
                return;
              }
              obs.onNext({device : filterStampsAndNulls(d), location:l});
              obs.onCompleted();
            });
        });
      }).map(obj => {
        let l = obj.location;
        return {
          id : l.id,
          metadate : obj.device,
          type : 'Feature',
          geometry : {
            type : 'Point',
            coordinates : [l.x,l.y]
          }
        };
      }).toArray();
    }
  };
})();
