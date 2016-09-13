'use strict';

var express = require('express');
var config = require('./config');
var forms = require('./forms');
var stores = require('./stores');
var devices = require('./devices');
var users = require('./users');
var wfs = require('./wfs');
var jwt = require('jsonwebtoken');
var dispatcher = require('./../dispatcher');

var apiRoutes = express.Router();

module.exports = function(app) {
  app.use('/api', apiRoutes);

  apiRoutes.use((req,res,next) => {
    console.log(req.path, req.method);
    if (req.path === '/users' && req.method === 'POST') {
      return next();
    }
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
      jwt.verify(token,'9014607A0AF70C4DF57A4D',(err,decoded) => {
        if (err) {
          return res.json({
            success: false,
            message: 'Failed to authenticate token.'
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      // return an error
      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      });
    }
  });

  apiRoutes.use('/config', config);
  apiRoutes.use('/forms', forms);
  apiRoutes.use('/stores', stores(dispatcher));
  apiRoutes.use('/devices',devices);
  apiRoutes.use('/users',users);
  apiRoutes.use('/wfs', wfs);
};
