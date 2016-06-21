'use strict';

var express = require('express');
let router = express.Router();
var models = require('../models/');
var Rx = require('rx');
var _ = require('lodash');

const tKeys = ['created_at', 'updated_at', 'deleted_at'];

var filterStampsAndNulls = (ff) => {
  return _.chain(ff.dataValues)
    .omit(tKeys)
    .omit('form_id')
    .omitBy(_.isNull)
    .value();
};

router.post('/register', (req, res) => {
  Rx.Observable.fromPromise(models.Devices.upsert({
    identifier : req.body.identifier,
    name : req.body.name
  })).subscribe(
    () => res.json({success:true}),
    (err) => res.json({success:false,message:err})
  );
});

module.exports = router;
