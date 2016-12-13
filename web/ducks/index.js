import { combineReducers } from 'redux';
import dataStores from './dataStores';
import forms from './forms';
import auth from './auth';
import data from './data';
import triggers from './triggers';
import menu from './menu';
import teams from './teams';

// http://redux.js.org/docs/api/combineReducers.html
const appReducer = combineReducers({
  dataStores,
  forms,
  auth,
  data,
  triggers,
  menu,
  teams,
});

export default appReducer;
