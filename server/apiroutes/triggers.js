'use strict';

var express = require('express');
var router = express.Router();
var TriggerCommand = require('./../commands/trigger');
var response = require('./../httpresponse');
var dispatcher = require('./../dispatcher');

router.get('/',(req,res) => {
  TriggerCommand.triggers()
    .subscribe(
      d => response.success(res,d),
      err => response.internalError(res,err)
    );
});

router.post('/',(req,res) => {
  TriggerCommand.createTrigger(req.body)
    .subscribe(
      d => {
        response.success(res,d);
        dispatcher.publish(TriggerCommand.CHANNEL_TRIGGER_CREATE,d);
      },
      err => response.internalError(res,err)
    );
});

router.put('/',(req,res) => {
  TriggerCommand.updateTrigger(req.body)
    .subscribe(
      d => {
        response.success(res,d);
        dispatcher.publish(TriggerCommand.CHANNEL_TRIGGER_UPDATE);
      },
      err => response.internalError(res,err)
    );
});

module.exports = router;
