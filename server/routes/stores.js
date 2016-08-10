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

var filterNullLayers = s => {
  s.default_layers = _.remove(s.default_layers,(dl) => {
    return dl !== null;
  });
  return s;
};

router.get('/', (req, res) => {
  Rx.Observable.fromPromise(models.Stores.findAll())
    .flatMap(Rx.Observable.fromArray)
    .map(filterStampsAndNulls)
    .map(filterNullLayers)
    .toArray()
    .subscribe(
      (stores) => res.json(stores),
      () => res.status(500).send()
    );
});

router.post('/', (req, res) => {
  Rx.Observable.fromPromise(models.Stores.create(req.body))
    .map(filterStampsAndNulls)
    .subscribe(
      storeData => res.json(storeData),
      () => res.status(500).send()
    );
});

router.get('/:storeId', (req, res) => {
  Rx.Observable.fromPromise(models.Stores.findById(req.params.storeId))
    .map(filterStampsAndNulls)
    .map(filterNullLayers)
    .subscribe(
      stores => res.json(stores),
      () => res.status(404).send()
    );
});

router.put('/:storeId', (req, res) => {
  Rx.Observable.fromPromise(models.Stores.update(req.body, {
    where: { id: req.params.storeId }
  }))
    .toArray()
    .subscribe(
      () => res.json({success: true}),
      () => res.status(500).send()
    );
});

router.delete('/:storeId', (req, res) => {
  Rx.Observable.fromPromise(models.Stores.destroy({
    where: { id: req.params.storeId }
  }))
    .subscribe(
      () => res.json({success: true}),
      () => res.status(500).send()
    );
});

module.exports = router;
