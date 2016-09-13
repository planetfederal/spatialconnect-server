'use strict';

var express   = require('express');
let router    = express.Router();
var ConfigCommand = require('./../commands/config');
var response = require('./../httpresponse');

router.get('/',(req,res) => {
  ConfigCommand.full()
    .subscribe(
      d => response.success(res,d),
      e => response.internalError(res,e)
    );
});

module.exports = router;
