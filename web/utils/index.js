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
}

export const requireAuthentication = UserAuthWrapper({
  authSelector: state => state.sc.auth,
  predicate: auth => auth.isAuthenticated,
  redirectAction: push,
  wrapperDisplayName: 'UserIsJWTAuthenticated'
});