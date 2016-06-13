'use strict';

var express = require('express');
let router = express.Router();

router.get('/ping',(req,res) => {
  res.render('index.html');
});

module.exports = router;
