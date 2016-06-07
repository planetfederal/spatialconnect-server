'use strict';
import { combineReducers } from 'redux';
import events from './events';
import dataStores from './dataStores';
import forms from './forms';

// http://redux.js.org/docs/api/combineReducers.html
const appReducer = combineReducers({
  events,
  dataStores,
  forms
});

export default appReducer;
