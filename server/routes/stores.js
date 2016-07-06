'use strict';

let express = require('express');
let router  = express.Router();
let models  = require('./../models/');
let Rx      = require('rx');
let _       = require('lodash');

const tKeys = ['created_at','updated_at','deleted_at'];

var filterStampsAndNulls = (ff) => {
  return _.chain(ff.dataValues)
    .omit(tKeys)
    .omitBy(_.isNull)
    .value();
};

router.get('/', (req,res) => {
  Rx.Observable.fromPromise(models.Stores.findAll())
    .flatMap(Rx.Observable.fromArray)
    .map(filterStampsAndNulls)
    .toArray()
    .subscribe(
      (stores) => res.json(stores),
      (err) => console.log(err)
    );
});

router.post('/', (req,res) => {
  Rx.Observable.fromPromise(models.Stores.create(req.body))
    .map(filterStampsAndNulls)
    .subscribe(storeData => res.json(storeData), err => console.log(err));
});

router.get('/:storeId', (req, res) => {
  Rx.Observable.fromPromise(models.Stores.findById(req.params.storeId))
    .map(filterStampsAndNulls)
    .subscribe(stores => res.json(stores), err => res.status(500).send());
});

router.put('/:storeId', (req, res) => {
  Rx.Observable.fromPromise(models.Stores.update(req.body, {
    where: { id: req.params.storeId }
  }))
    .toArray()
    .subscribe(
      () => res.json({success: true}),
      err => res.json({success: false, err: err})
    );
});

router.delete('/:storeId', (req, res) => {
  Rx.Observable.fromPromise(models.Stores.destroy({
    where: { id: req.params.storeId }
  }))
    .subscribe(
      () => res.json({success: true}),
      err => res.json({success: false, err: err})
    );
});

module.exports = router;
