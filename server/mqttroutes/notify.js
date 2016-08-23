'use strict';

var NotifyCommands = require('./../commands/notify');

module.exports = (mqttClient,dispatcher) => {

  let publishNotification = n => {
    const notif = n.value();
    if (notif.to === 'all') {
      mqttClient.publishObj('/notify',notif);
    } else {
      mqttClient.publishObj('/notify/'+notif.to,notif);
    }
  };

  let setupListeners = () => {
    dispatcher.subscribe(NotifyCommands.CHANNEL_NOTIFY_INFO,publishNotification);
  };

  return {
    setupListeners
  };
};
