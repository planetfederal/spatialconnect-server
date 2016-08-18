'use strict';
import { combineReducers } from 'redux';
import dataStores from './dataStores';
import forms from './forms';
import auth from './auth';
import data from './data';

// http://redux.js.org/docs/api/combineReducers.html
const appReducer = combineReducers({
  dataStores,
  forms,
  auth,
  data
});

export default appReducer;
