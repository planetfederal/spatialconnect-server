import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { UserAuthWrapper } from 'redux-auth-wrapper'
import { push } from 'react-router-redux';
import { find } from 'lodash';

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
  let key = s.toLowerCase().replace(/ /g, '_');
  return key;
};

export const initForm = auth => {
  return form => {
    let team = find(auth.teams, { id: form.team_id });
    let newForm = {
      ...form,
      team_name: team ? team.name : null,
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
}

export const initStore = auth => {
  return store => {
    let team = find(auth.teams, { id: store.team_id });
    return {
      ...store,
      team_name: team ? team.name : null
    };
  }
}
