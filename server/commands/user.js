'use strict';

var hashPass = require('./../util').hashPass;
var _ = require('lodash');
var Rx = require('rx');
var models = require('./../models/');

module.exports = {
  createUser : (user) => {
    const email = user.email;
    const password = user.password;
    const name = user.name;

    if (!password) {
      return Rx.Observable.throw({
        message: 'password not set'
      });
    }
    if (!name) {
      return Rx.Observable.throw({
        message: 'name not set'
      });
    }
    if (!email) {
      return Rx.Observable.throw({
        message: 'email not set'
      });
    }

    return hashPass(password)
      .flatMap((hash) => {
        if (_.isUndefined(hash)) {
          return Rx.Observable.throw(new Error('Hash Not Defined'));
        }
        return Rx.Observable.fromPromise(
          models.Users.create({
            name : name,
            email : email,
            password : hash
          })
        );
      });
  },
  users : () => {
    return Rx.Observable.fromPromise(
      models.Users.findAll())
      .flatMap(Rx.Observable.fromArray)
      .map((user) => {
        return _.omit(user.dataValues,['created_at','deleted_at','updated_at','password']);
      }).toArray();
  }
};
