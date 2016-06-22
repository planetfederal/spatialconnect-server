'use strict';

var express = require('express');
let router = express.Router();
var models = require('../models/');
var Rx = require('rx');

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
