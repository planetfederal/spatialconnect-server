'use strict';

var express = require('express');
var router = express.Router();
var models = require('./../models/');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Rx = require('rx');

router.post('/',(req,res) => {
  const email = req.body.email;
  Rx.Observable.fromPromise(models.Users.findOne({
    where : {
      email : email
    }
  })).flatMap((user) => {
    return Rx.Observable.create((sub) => {
      if (!user) {
        sub.onError({
          success:false,
          message:'User not found.'
        });
      } else if (user) {
        bcrypt.compare(req.body.password,user.password,(err,r) => {
          if (!r) {
            sub.onError({
              success:false,
              message:'Wrong password.'
            });
          } else {
            var token = jwt.sign({user:user.email}, '9014607A0AF70C4DF57A4D');
            sub.onNext({
              success: true,
              token: token
            });
            sub.onCompleted();
          }
        });
      }
    });
  }).subscribe(
    (d) => res.json(d),
    (err) => res.json(err)
  );
});

module.exports = router;
