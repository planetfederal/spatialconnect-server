'use strict';

var bcrypt = require('bcryptjs');
var Rx = require('rx');
var models = require('./../models');
var jwt = require('jsonwebtoken');

module.exports = {
  authenticate : (email,pass) => {
    return Rx.Observable.fromPromise(
      models.Users.findOne({
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
            bcrypt.compare(pass,user.password,(err,r) => {
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
      });
  }
};
