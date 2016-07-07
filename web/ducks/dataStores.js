'use strict';
import { reset } from 'redux-form';
import * as request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import { API_URL } from 'config';
import { push } from 'react-router-redux';
import uuid from 'node-uuid';
import { find } from 'lodash';

// define action types
export const LOAD = 'sc/dataStores/LOAD';
export const LOAD_SUCCESS = 'sc/dataStores/LOAD_SUCCESS';
export const LOAD_FAIL = 'sc/dataStores/LOAD_FAIL';

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

export function loadDataStore(storeId) {
  return (dispatch, getState) => {
    const { sc } = getState();
    let store = find(sc.dataStores.stores, { id: storeId });
    if (store) {
      return dispatch(receiveStores([store]));
    } else {
      dispatch({ type: LOAD });
      return request
        .get(API_URL + 'stores/' + storeId)
        .then(function(res) {
          return dispatch(receiveStores([res.body]));
        }, function(error) {
          return dispatch({type: LOAD_FAIL, error: error});
        });
    }
  }
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
    return request
      .get(API_URL + 'stores')
      .then(function(res) {
        return dispatch(receiveStores(res.body));
      }, function(error) {
        return dispatch({type: LOAD_FAIL, error: error});
      });
  }
}

export function submitNewDataStore(data) {
  return dispatch => {
    return request
      .post(API_URL + 'stores')
      .send(data)
      .then(function(res) {
        return dispatch(loadDataStores());
      }, function(error) {
        throw new Error(res);
      });
  };
}

export function updateDataStore(id, data) {
  return dispatch => {
    return request
      .put(API_URL + 'stores/' + id)
      .send(data)
      .then(function(res) {
        return dispatch(loadDataStores());
      }, function(error) {
        throw new Error(res);
      });

    // clear the form values
    dispatch(reset('dataStore'));
  };
}

export function updateDataStores(values) {
  return dispatch => {
    return Promise.map(values, (value) => {
      return request
        .put(API_URL + 'stores/' + value.id)
        .send(value)
        .promise()
    }).then(() => {
      return dispatch(loadDataStores());
    }).catch((e) => {
      throw new Error(e);
    })

    dispatch(reset('dataStore'));
  };
}

export function deleteStore(storeId) {
  return dispatch => {
    return request
      .delete(API_URL + 'stores/' + storeId)
      .then(function(res) {
        dispatch(push('/stores'));
      }, function(error) {
        throw new Error(res);
      });
  };
}
