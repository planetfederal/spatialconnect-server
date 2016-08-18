'use strict';

var path = require('path');
var express = require('express');
var ping = require('./ping');
var authenticate = require('./authenticate');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var logger = require('morgan');

module.exports = function(app) {
  app.use(cors());
  app.use(logger('dev'));
  app.use(bodyParser.urlencoded({extended : false}));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname,'../web')));

  app.get('/dist/bundle.js', function(req, res) {
    res.sendFile(path.join(__dirname, '../web/dist/bundle.js'));
  });

  // return the index for any non-api call
  app.get(/^\/((?!api).)/, function(req, res) {
    res.sendFile(path.join(__dirname, '../web/index.html'));
  });

  var router = express.Router();
  app.use('/',router);
  router.use('/api/ping', ping);
  router.use('/api/authenticate',authenticate);
};
