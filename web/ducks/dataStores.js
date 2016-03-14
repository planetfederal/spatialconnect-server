'use strict';
import { reset } from 'redux-form';
import * as request from 'superagent';
const API_URL = 'http://default:3000/api/'; // TODO: make this an env var
 import uuid from 'node-uuid';

// define action types
export const LOAD = 'sc/dataStores/LOAD';
export const LOAD_SUCCESS = 'sc/dataStores/LOAD_SUCCESS';
export const LOAD_FAIL = 'sc/dataStores/LOAD_FAIL';
export const ADD_NEW_DATA_STORE_CLICKED = 'sc/dataStores/ADD_NEW_DATA_STORE_CLICKED';

// define an initialState
const initialState = {
  loading: false,
  loaded: false,
  stores: [],
  addingNewDataStore: false,
  newDataStoreId: null
};

// export the reducer function, (previousState, action) => newState
export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    // note that we do not mutate the previous state; instead we use the object
    // spread operator to make a more readable, succinct expression of the
    // updated state.  For more details see:
    // http://redux.js.org/docs/recipes/UsingObjectSpreadOperator.html
    case LOAD:
      return {
        ...state,
        loading: true,
        addingNewDataStore: false
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        stores: action.stores
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case ADD_NEW_DATA_STORE_CLICKED:
      return {
        ...state,
        addingNewDataStore: true,
        newDataStoreId: uuid.v4()
      };
    // return the previousState if no actions match
    default: return state;
  }
}


// export the action creators (functions that return actions or functions)
export function receiveStores(stores) {
  return {
    type: LOAD_SUCCESS,
    stores: stores
  };
}

export function loadDataStores() {
  // When action creators return functions instead of plain action objects, they
  // are handled by the thunk middleware, which passes the dispatch method as
  // an argument to the function
  return dispatch => {

    // disptach an action to update the state, indicating we are starting the
    // request to load events
    dispatch({ type: LOAD });

    // async get the stores and dispatch action when they are received
    request
      .get(API_URL + 'stores')
      .end(function(err, res) {
        if (err) {
          throw new Error(res);
        }
        dispatch(receiveStores(res.body));
      });
  }
}

export function addNewDataStoreClicked() {
  // clear the form values
  return dispatch => {
    dispatch(reset('dataStore'));
    dispatch({type: ADD_NEW_DATA_STORE_CLICKED});
  };
}

export function submitNewDataStore(data) {
  return dispatch => {
    request
      .post(API_URL + 'stores')
      .send(data)
      .end(function(err, res) {
        if (err) {
          throw new Error(res);
        }
        dispatch(loadDataStores());
      });
  };
}

export function updateDataStore(id, data) {
  return dispatch => {
    request
      .put(API_URL + 'stores/' + id)
      .send(data)
      .end(function(err, res) {
        if (err) {
          throw new Error(res);
        }
        dispatch(loadDataStores());
      });

    // clear the form values
    dispatch(reset('dataStore'));
  };
}
