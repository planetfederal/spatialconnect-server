'use strict';

var express = require('express');
let router = express.Router();
var DeviceCommand = require('./../commands/device');
var response = require('./../httpresponse');

router.post('/register', (req, res) => {
  DeviceCommand.register(req.body)
    .subscribe(
      () => response.success(res,{success:true}),
      err => response.internalError(res,err)
    );
});

router.get('/',(req,res) => {
  DeviceCommand.devices().subscribe(s => response.success(res,s));
});

router.get('/:identifier', (req,res) => {
  DeviceCommand.device(req.params.identifier)
    .subscribe(
      s => response.success(res,s),
      err => response.internalError(res,err)
  );
});

module.exports = router;
