'use strict';

var express = require('express');
var router = express.Router();
var AuthCommands = require('./../commands/authenticate');
var response = require('./../httpresponse');

router.post('/',(req,res) => {
  let email = req.body.email;
  let pass = req.body.password;

  AuthCommands.authenticate(email,pass)
    .subscribe(
      d => response.success(res,d),
      err => response.unauthorized(res,err)
    );
});

module.exports = router;
