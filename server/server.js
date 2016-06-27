'use strict';

var express = require('express');
var router = express.Router();
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var ping = require('./routes/ping');
var config = require('./routes/config');
var forms = require('./routes/forms');
var devices = require('./routes/devices');
var stores = require('./routes/stores');
var authenticate = require('./routes/authenticate');
var users = require('./routes/users');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'../web')));

app.use('/api', router);

// return the index for any non-api call
app.get(/^\/((?!api).)/, function(req, res) {
  res.sendFile(path.join(__dirname, '../web/index.html'));
});

app.use((req,res,next) => {
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

router.use('/ping', ping);
router.use('/config', config);
router.use('/forms', forms);
router.use('/stores', stores);
router.use('/devices',devices);
router.use('/users',users);
router.use('/authenticate',authenticate);

var server = app.listen(8085, function () {
  console.log('SpatialConnect-Server listening on port 8085!');
});

module.exports = server;
