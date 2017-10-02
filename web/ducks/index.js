import { combineReducers } from 'redux';
import dataStores from './dataStores';
import forms from './forms';
import auth from './auth';
import data from './data';
import menu from './menu';
import teams from './teams';
import messages from './messages';

// http://redux.js.org/docs/api/combineReducers.html
const appReducer = combineReducers({
  dataStores,
  forms,
  auth,
  data,
  menu,
  teams,
  messages,
});

export default appReducer;
