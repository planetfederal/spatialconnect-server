'use strict';

var models = require('./../models/');

module.exports = (mqttClient) => {
  mqttClient.listenOnTopic('/config')
    .subscribe(
      (d) => console.log('Message From Config:' + d.message.toString()),
      (err) => console.log(err)
    );

  return {
    name : 'config'
  };
};
