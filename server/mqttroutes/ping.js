'use strict';

module.exports = (mqttClient) => {
  mqttClient.listenOnTopic('/ping').subscribe(
    (d) => {
      d.payload = 'pong';
      mqttClient.publishObj(d.replyTo,d);
    }
  );

  let setupListeners = () => {

  };

  return {
    name : 'ping',
    setupListeners
  };
};
