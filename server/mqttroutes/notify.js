'use strict';

var NotifyCommands = require('./../commands/notify');

module.exports = (mqttClient,dispatcher) => {

  let publishNotification = obj => {
    mqttClient.publishObj('/notify',obj);
  };

  let setupListeners = () => {
    dispatcher.subscribe(NotifyCommands.CHANNEL_TRACKING_UPDATE,publishNotification);
  };

  return {
    setupListeners
  };
};
