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

var cors = require('cors');
var app = express();

app.use(cors());
app.use(express.static(__dirname+'/public'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));

app.use('/api', router);
router.use('/ping', ping);
router.use('/config', config);
router.use('/form', forms);


app.listen(8085, function () {
    console.log('Example app listening on port 8085!');
});
