'use strict';
var bcrypt = require('bcryptjs');
var Rx = require('rx');

const saltRounds = 10;

var hashPass = function(p) {
  return Rx.Observable.create((subscriber) => {
    bcrypt.genSalt(saltRounds,(err,salt) => {
      const plainTextPass = p;
      bcrypt.hash(plainTextPass,salt,(err,hash) => {
        if (err) {
          subscriber.onError(err);
        }
        subscriber.onNext(hash);
        subscriber.onCompleted();
      });
    });
  });
};

module.exports = {
  hashPass : hashPass
};
