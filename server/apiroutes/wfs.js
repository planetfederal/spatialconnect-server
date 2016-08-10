'use strict';

let express = require('express');
let WFSCommands = require('./../commands/wfs');

let router = express.Router();

router.get('/getCapabilities', (req, res) => {
  let url = req.query.url;
  WFSCommands.getCapabilities(url).subscribe(
    d => res.json(d),
    () => res.status(500).send()
  );
});

module.exports = router;
