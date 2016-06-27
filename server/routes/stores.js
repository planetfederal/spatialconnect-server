'use strict';

let express = require('express');
let router  = express.Router();
let models  = require('./../models/');
let Rx      = require('rx');
let _       = require('lodash');

const timestampKeys = ['created_at','updated_at','deleted_at'];

router.get('/', (req,res) => {
  Rx.Observable.fromPromise(models.Stores.findAll())
    .flatMap(Rx.Observable.fromArray)
    .map(stores =>  _.chain(stores.dataValues).omit(timestampKeys).omitBy(_.isNull).value())
    .toArray()
    .subscribe(
      (stores) => res.json(stores),
      (err) => console.log(err)
    );
});

module.exports = router;
