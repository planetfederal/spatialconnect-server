'use strict';

var express   = require('express');
let router    = express.Router();
var models    = require('../models/');
var Rx        = require('rx');
var _         = require('lodash');

const tKeys = ['created_at','updated_at','deleted_at'];

var filterStampsAndNulls = (ff) => {
  return _.chain(ff.dataValues).omit(tKeys).omitBy(_.isNull).value();
};

var formFields$ = (formId) => {
  return Rx.Observable.fromPromise(
    models.FormFields.findAll({
      where : {
        form_id : formId
      }
    })).flatMap(Rx.Observable.fromArray)
    .map(filterStampsAndNulls).toArray();
};

router.get('/',(req,res) => {
  let stores = Rx.Observable.fromPromise(models.Stores.findAll())
    .flatMap(Rx.Observable.fromArray)
    .map(filterStampsAndNulls).toArray();

  let forms = Rx.Observable.fromPromise(models.Forms.findAll())
    .flatMap(Rx.Observable.fromArray)
    .map(filterStampsAndNulls).flatMap((form) => {
      return Rx.Observable.create((subscriber) => {
        formFields$(form.id).subscribe(
          (ff) => {
            form.fields = ff;
            subscriber.onNext(form);
            subscriber.onCompleted();
          },(err) => subscriber.onError(err)
        );
      });
    }).toArray();

  stores.combineLatest(forms,(s,f) => ({stores : s, forms : f}))
    .subscribe(
      (p) => res.json(p),
      (err) => console.log(err)
    );
});

module.exports = router;
