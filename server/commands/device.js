'use strict';

var models = require('./../models/');
var Rx = require('rx');

module.exports = {
  register : dev => {
    return models.Devices.register(models,dev);
  },
  devices : () => {
    return Rx.Observable.fromPromise(
      models.Devices.findAll());
  },
  device : (ident) => {
    return Rx.Observable.fromPromise(
      models.Devices.findOne({
        where : {
          identifier : ident
        }
      }));
  }
};
