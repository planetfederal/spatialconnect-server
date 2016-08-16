'use strict';

var NotifyCommands = require('./../commands/notify');

module.exports = (mqttClient,dispatcher) => {

  let publishNotification = obj => {
    mqttClient.publishObj('/notify',{payload:obj});
  };

  let setupListeners = () => {
    dispatcher.subscribe(NotifyCommands.CHANNEL_NOTIFY_INFO,publishNotification);
  };

  return {
    setupListeners
  };
};
