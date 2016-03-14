'use strict';
import { combineReducers } from 'redux';
import events from './events';
import dataStores from './dataStores';

// http://redux.js.org/docs/api/combineReducers.html
const appReducer = combineReducers({
  events,
  dataStores
});

export default appReducer;
