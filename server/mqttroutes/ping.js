'use strict';

module.exports = (mqttClient) => {

  mqttClient.listenOnTopic('/ping').subscribe(
    (d) => {
      mqttClient.publishObj(d.replyTo,{payload:'pong'});
    }
  );

  let setupListeners = () => {

  };

  return {
    name : 'ping',
    setupListeners
  };
};
