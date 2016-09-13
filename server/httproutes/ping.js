'use strict';

var express = require('express');
var router = express.Router();
var response = require('./../httpresponse');

router.get('/',(req,res) => {
  response.success(res,'pong');
});

module.exports = router;
