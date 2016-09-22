'use strict';

var express = require('express');
var router = express.Router();
var response = require('./../httpresponse');
var TrackingCommand = require('./../commands/tracking');

router.get('/',(req,res) => {
  TrackingCommand.locations()
    .subscribe(
      l => response.success(res,{
        type : 'FeatureCollection',
        features : l
      }),
      err => response.internalError(res,err)
    );
});

module.exports = router;
