'use strict';

let _       = require('lodash');
let models  = require('./../models/');
let Rx      = require('rx');

const tKeys = ['created_at','updated_at','deleted_at'];

var filterStampsAndNulls = (ff) => {
  return _.chain(ff.dataValues)
    .omit(tKeys)
    .omitBy(_.isNull)
    .value();
};

var filterNullLayers = s => {
  s.default_layers = _.remove(s.default_layers,(dl) => {
    return dl !== null;
  });
  return s;
};

module.exports = (() => {
  const CHANNEL_STORE_CREATE = '@@channel/create_store';
  const CHANNEL_STORE_UPDATE = '@@channel/update_store';
  const CHANNEL_STORE_DELETE = '@@channel/delete_store';

  let stores = () => {
    return Rx.Observable.fromPromise(
      models.Stores.findAll())
      .flatMap(Rx.Observable.fromArray)
      .map(filterStampsAndNulls)
      .map(filterNullLayers);
  };
  let store = id => {
    return Rx.Observable.fromPromise(
      models.Stores.findById(id))
      .map(filterStampsAndNulls)
      .map(filterNullLayers);
  };
  let createStore = function(store) {
    return Rx.Observable.fromPromise(
      models.Stores.create(store))
      .map(filterStampsAndNulls);
  };
  let updateStore = (id,store) => {
    return Rx.Observable.fromPromise(
      models.Stores.update(store, {
        where: { id: id }
      }))
      .toArray();
  };
  let deleteStore = id => {
    return Rx.Observable.fromPromise(
      models.Stores.destroy({
        where: { id: id}
      }));
  };

  return {
    CHANNEL_STORE_CREATE,
    CHANNEL_STORE_UPDATE,
    CHANNEL_STORE_DELETE,
    stores : stores.bind(this),
    store,
    createStore : createStore.bind(this),
    updateStore,
    deleteStore
  };

})();
