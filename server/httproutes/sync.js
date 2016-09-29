'use strict';

var express = require('express');
var router = express.Router();
var response = require('../httpresponse');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
var geogig = require('../geogig');
var client = new geogig.Client();

router.post('/', upload.single('geopackage'), function (req, res, next) {
  let repoName = req.body.repoName;
  client.importGeoPackage(repoName, req.file.path, 'master', true)
        .subscribe(res => console.log(res));
  response.success(res, 'attempting async import to geogig');
});

module.exports = router;
