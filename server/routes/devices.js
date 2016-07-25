'use strict';

var express = require('express');
let router = express.Router();
var models = require('../models/');
var Rx = require('rx');

router.post('/register', (req, res) => {
  Rx.Observable.fromPromise(models.Devices.upsert({
    identifier: req.body.identifier,
    device_info: req.body.device_info
  })).subscribe(
    () => res.json({success:true}),
    (err) => res.json({success:false,message:err})
  );
});

router.get('/',(req,res) => {
  Rx.Observable.fromPromise(models.Devices.findAll())
    .subscribe(
      (s) => res.json(s),
      (err) => res.json({error:err})
    );
});

router.get('/:identifier', (req,res) => {
  Rx.Observable.fromPromise(models.Devices.findOne({
    where : {
      identifier : req.params.identifier
    }
  })).subscribe(
    (s) => res.json(s),
    (err) => res.error({error:err})
  );
});

module.exports = router;
