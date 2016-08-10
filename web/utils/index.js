import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { UserAuthWrapper } from 'redux-auth-wrapper'
import { push } from 'react-router-redux';

export function checkHttpStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
};

export const requireAuthentication = UserAuthWrapper({
  authSelector: state => state.sc.auth,
  predicate: auth => auth.isAuthenticated,
  redirectAction: push,
  wrapperDisplayName: 'UserIsJWTAuthenticated'
});

export const isUrl = (s) => {
  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
  return regexp.test(s);
};

export const toKey = (s) => {
  let key = s.toLowerCase().replace(' ', '_');
  return key;
};

export const initForm = form => {
  let newForm = {
    ...form,
    value: {},
    deletedFields: []
  };
  form.fields.forEach(field => {
    if (field.hasOwnProperty('initialValue')) {
      newForm.value[field.field_key] = field.initialValue;
    }
  });
  return newForm;
}