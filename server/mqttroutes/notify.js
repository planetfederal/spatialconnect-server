'use strict';

var NotifyCommands = require('./../commands/notify');
var _ = require('lodash');

module.exports = (mqttClient,dispatcher) => {

  let publishNotification = n => {
    const notif = n.value();
    console.log(notif);
    if (notif.to === 'all') {
      mqttClient.publishObj('/notify',{payload:JSON.stringify(notif)});
    } else {
      if(_.isArray(notif.to)) {
        _.each(notif.to,t => {
          mqttClient.publishObj('/notify/'+t,{payload:JSON.stringify(notif)});
        });
      } else {
        mqttClient.publishObj('/notify/'+notif.to,{payload:JSON.stringify(notif)});
      }
    }
  };

  let setupListeners = () => {
    dispatcher.subscribe(NotifyCommands.CHANNEL_NOTIFY_INFO,publishNotification);
  };

  return {
    setupListeners
  };
};
