'use strict';

var _ = require('lodash');
var models = require('./../models/');
var Rx = require('rx');

const tKeys = ['created_at','updated_at','deleted_at'];

var filterStampsAndNulls = (ff) => {
  return _.chain(ff.dataValues)
    .omit(tKeys)
    .omitBy(_.isNull)
    .value();
};

module.exports = {
  full : () => {
    let stores = Rx.Observable.fromPromise(models.Stores.findAll())
      .flatMap(Rx.Observable.fromArray)
      .map(filterStampsAndNulls)
      .map((v) => {
        v.default_layers = _.remove(v.default_layers,(dl) => {
          return dl !== null;
        });
        return v;
      }).toArray();

    let forms = models.Forms.uniqueForms$(models)
      .flatMap((form) => {
        return Rx.Observable.create((subscriber) => {
          models.FormFields.formFields$(models,form.id).subscribe(
            (ff) => {
              form.fields = ff;
              subscriber.onNext(form);
              subscriber.onCompleted();
            },(err) => subscriber.onError(err)
          );
        });
      }).toArray();

    return stores.combineLatest(forms,(s,f) => ({stores : s, forms : f}));
  }
};
