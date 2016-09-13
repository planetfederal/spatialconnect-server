'use strict';

var express = require('express');
let router = express.Router();
var DeviceCommand = require('./../commands/device');

router.post('/register', (req, res) => {
  DeviceCommand.register(req.body)
    .subscribe(
      () => res.json({success:true}),
      err => res.json({success:false,message:err})
    );
});

router.get('/',(req,res) => {
  DeviceCommand.devices().subscribe(s => res.json(s));
});

router.get('/:identifier', (req,res) => {
  DeviceCommand.device(req.params.identifier)
    .subscribe(
      s => res.json(s),
      () => res.status(500).send()
  );
});

module.exports = router;
