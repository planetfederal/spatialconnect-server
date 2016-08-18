'use strict';

var express = require('express');
var router = express.Router();
var AuthCommands = require('./../commands/authenticate');

router.post('/',(req,res) => {
  let email = req.body.email;
  let pass = req.body.password;

  AuthCommands.authenticate(email,pass)
    .subscribe(
      (d) => res.json(d),
      (err) => res.json(err)
    );
});

module.exports = router;
