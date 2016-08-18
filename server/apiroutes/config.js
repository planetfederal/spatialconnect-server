'use strict';

var express   = require('express');
let router    = express.Router();
var ConfigCommand = require('./../commands/config');

router.get('/',(req,res) => {
  ConfigCommand.full()
    .subscribe(
      d => res.json(d),
      e => res.status(500).send(e)
    );
});

module.exports = router;
