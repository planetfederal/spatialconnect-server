'use strict';

var models = require('./../models/');
var Rx = require('rx');

module.exports = (mqttClient) => {

  Rx.Observable.fromPromise(models.Stores.findAll())
    .flatMap(Rx.Observable.fromArray)
    .subscribe(
      (store) => {
        mqttClient.listenOnTopic('/store/'+store.id)
          .subscribe(
            (d) => console.log('Message From ' + store.id + ':' + d.message.toString()),
            (err) => console.log(err)
          );
      }
    );

  return {
    name : 'STORES'
  };
};
