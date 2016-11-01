'use strict';

var express = require('express');
let router = express.Router();

// if they are able to access this POST endpoint then their token was valid so
// we consider them authorized.  in the future we may want to check other props
// about in the request before authorizing the user
router.post('/', (req, res) => res.status(204).send());

module.exports = router;
