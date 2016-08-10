'use strict';

var express = require('express');
let router = express.Router();
var UserCommands = require('./../commands/user');

router.get('/',(req,res) => {
  UserCommands.users().subscribe(d => {
    res.json(d);
  },err => {
    res.status(500).json({
      success:false,
      error:err
    });
  });
});

router.post('/',(req,res) => {
  UserCommands.createUser(req.body)
    .subscribe(d => res.json(d),err => {
      res.status(500).json({
        success:false,
        error:err
      });
    });
});

module.exports = router;
