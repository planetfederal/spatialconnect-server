'use strict';

module.exports = function() {
  let returnObject = {};

  let notification = {
    to : 'all',
    priority : 'info',
    notification : {
      body : '',
      title : '',
      icon : ''
    },
    payload : {}
  };

  returnObject.to = (recipient) => {
    notification.to = recipient;
    return returnObject;
  };

  returnObject.alert = () => {
    notification.priority = 'alert';
    return returnObject;
  };

  returnObject.background = () => {
    notification.priority = 'background';
    return returnObject;
  };

  returnObject.info = () => {
    notification.info = 'info';
    return returnObject;
  };

  returnObject.body = b => {
    notification.notification.body = b;
    return returnObject;
  };

  returnObject.title = t => {
    notification.notification.title = t;
    return returnObject;
  };

  returnObject.icon = i => {
    notification.notification.icon = i;
    return returnObject;
  };

  returnObject.payload = p => {
    notification.payload = p;
    return returnObject;
  };

  returnObject.value = () => {
    return notification;
  };

  return returnObject;
};
