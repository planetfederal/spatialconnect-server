'use strict';

var models = require('./../models/');
var Rx = require('rx');
var _ = require('lodash');

const tKeys = ['created_at','updated_at','deleted_at'];

var filterStampsAndNulls = ff => {
  return _.chain(ff.dataValues)
    .omit(tKeys)
    .omitBy(_.isNull)
    .value();
};

module.exports = (() => {
  return {
    CHANNEL_TRIGGER_CREATE : '@@channel/trigger_create',
    CHANNEL_TRIGGER_REMOVE : '@@channel/trigger_remove',
    CHANNEL_TRIGGER_UPDATE : '@@channel/trigger_update',
    createTrigger : t => {
      return Rx.Observable.fromPromise(
        models.Triggers.create(t)
      ).map(t => {
        return filterStampsAndNulls(t);
      });
    },
    updateTrigger : t => {
      return Rx.Observable.fromPromise(
        models.SpatialTriggers.findById(t.id)
      ).flatMap(trg => {
        trg.definition = t.definition;
        trg.recipients = t.recipients;
        return Rx.Observable.fromPromise(trg.save());
      });
    },
    deleteTrigger : tId => {
      return models.Triggers.destroy({
        where : {
          id : tId
        }
      });
    },
    triggers : () => {
      return Rx.Observable.fromPromise(
        models.Triggers.findAll())
        .flatMap(Rx.Observable.fromArray)
        .map(t => {
          return filterStampsAndNulls(t);
        }).toArray();
    }
  };
})();
