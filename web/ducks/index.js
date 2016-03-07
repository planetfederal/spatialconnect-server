'use strict';
import { combineReducers } from 'redux';
import events from './events';

// http://redux.js.org/docs/api/combineReducers.html
const appReducer = combineReducers({
  events
});

export default appReducer;
