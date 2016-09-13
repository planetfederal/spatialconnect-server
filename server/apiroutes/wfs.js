'use strict';

var express = require('express');
var WFSCommands = require('./../commands/wfs');
var response = require('./../httpresponse');
var router = express.Router();

router.get('/getCapabilities', (req, res) => {
  var url = req.query.url;
  WFSCommands.getCapabilities(url).subscribe(
    d => response.success(res,d),
    err => response.internalError(res,err)
  );
});

module.exports = router;
