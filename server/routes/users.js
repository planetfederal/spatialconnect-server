'use strict';

var express = require('express');
let router = express.Router();
var models = require('./../models/');
var Rx = require('rx');
var hashPass = require('./../util').hashPass;
var _ = require('lodash');

router.post('/',(req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  if (_.isUndefined(password)) {
    res.status(500).json({success:false,error:'password Not Set'});
    return;
  }
  if (_.isUndefined(name)) {
    res.status(500).json({success:false,error:'name Not Set'});
    return;
  }
  if (_.isUndefined(email)) {
    res.status(500).json({success:false,error:'email Not Set'});
    return;
  }

  hashPass(password)
    .flatMap((hash) => {
      if (_.isUndefined(hash)) {
        res.status(500).json({success:false,error:'Hash Not Defined'});
        return Rx.Observable.throw(new Error('Hash Not Defined'));
      }
      return Rx.Observable.fromPromise(
        models.Users.create({
          name : req.body.name,
          email : req.body.email,
          password : hash
        })
      );
    }).subscribe(
    () => res.json({success:true}),
    (err) => res.status(500).json({success:false,error:err})
  );
});

router.get('/',(req,res) => {
  Rx.Observable.fromPromise(models.Users.findAll())
    .flatMap(Rx.Observable.fromArray)
    .map((user) => {
      return _.omit(user.dataValues,['created_at','deleted_at','updated_at','password']);
    }).toArray().subscribe(
      (d) => res.json(d),
      (err) => res.json({success:false,error:err})
    );
});

module.exports = router;
