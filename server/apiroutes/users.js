'use strict';

var express = require('express');
var router = express.Router();
var UserCommands = require('./../commands/user');
var response = require('./../httpresponse');

router.get('/',(req,res) => {
  UserCommands.users().subscribe(
    d => response.success(res,d),
    err => response.internalError(res,err)
  );
});

router.post('/',(req,res) => {
  UserCommands.createUser(req.body)
    .subscribe(
      d => response.success(res,d),
      err => response.internalError(res,err)
    );
});

module.exports = router;
