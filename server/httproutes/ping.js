'use strict';

var express = require('express');
let router = express.Router();

router.get('/',(req,res) => {
  res.send('pong');
});

module.exports = router;
