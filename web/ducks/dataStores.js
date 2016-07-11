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
    let token = sc.auth.token;
    let store = find(sc.dataStores.stores, { id: storeId });
    if (store) {
      return dispatch(receiveStores([store]));
    } else {
      dispatch({ type: LOAD });
      return request
        .get(API_URL + 'stores/' + storeId)
        .set('x-access-token', token)
        .then(function(res) {
          return dispatch(receiveStores([res.body]));
        }, function(error) {
          return dispatch({type: LOAD_FAIL, error: error});
        });
    }
  }
}

export function loadDataStores() {
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    dispatch({ type: LOAD });
    return request
      .get(API_URL + 'stores')
      .set('x-access-token', token)
      .then(function(res) {
        return dispatch(receiveStores(res.body));
      }, function(error) {
        return dispatch({type: LOAD_FAIL, error: error});
      });
  }
}

export function submitNewDataStore(data) {
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    return request
      .post(API_URL + 'stores')
      .set('x-access-token', token)
      .send(data)
      .then(function(res) {
        return dispatch(loadDataStores());
      }, function(error) {
        throw new Error(res);
      });
  };
}

export function updateDataStore(id, data) {
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    return request
      .put(API_URL + 'stores/' + id)
      .set('x-access-token', token)
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
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    return Promise.map(values, (value) => {
      return request
        .put(API_URL + 'stores/' + value.id)
        .set('x-access-token', token)
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
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    return request
      .delete(API_URL + 'stores/' + storeId)
      .set('x-access-token', token)
      .then(function(res) {
        dispatch(push('/stores'));
      }, function(error) {
        throw new Error(res);
      });
  };
}
