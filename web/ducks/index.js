'use strict';
import { combineReducers } from 'redux';
import dataStores from './dataStores';
import forms from './forms';
import auth from './auth';

// http://redux.js.org/docs/api/combineReducers.html
const appReducer = combineReducers({
  dataStores,
  forms,
  auth
});

export default appReducer;
