'use strict';
import { reset } from 'redux-form';
import * as request from 'superagent-bluebird-promise';
import { API_URL } from 'config';

// define action types
export const LOAD = 'sc/events/LOAD';
export const LOAD_SUCCESS = 'sc/events/LOAD_SUCCESS';
export const LOAD_FAIL = 'sc/events/LOAD_FAIL';
export const ADD_NEW_EVENT_CLICKED = 'sc/events/ADD_NEW_EVENT_CLICKED';

// define an initialState
const initialState = {
  loading: false,
  loaded: false,
  events: [],
  addingNewEvent: false
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
        addingNewEvent: false
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        events: action.events
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case ADD_NEW_EVENT_CLICKED:
      return {
        ...state,
        addingNewEvent: true
      };
    // return the previousState if no actions match
    default: return state;
  }
}


// export the action creators (functions that return actions or functions)
export function receiveEvents(events) {
  return {
    type: LOAD_SUCCESS,
    events: events
  };
}

export function loadEvents() {
  // When action creators return functions instead of plain action objects, they
  // are handled by the thunk middleware, which passes the dispatch method as
  // an argument to the function
  return dispatch => {

    // disptach an action to update the state, indicating we are starting the
    // request to load events
    dispatch({ type: LOAD });

    // async get the events and dispatch action when they are received
    return request
      .get(API_URL + 'events')
      .then(function(res) {
        return dispatch(receiveEvents(res.body));
      }, function(error) {
        throw new Error(res);
      });
  }
}

export function addNewEventClicked() {
  return {
    type: ADD_NEW_EVENT_CLICKED
  };
}

export function submitNewEvent(data) {
  return dispatch => {
    return request
      .post(API_URL + 'events')
      .send(data)
      .then(function(res) {
        return dispatch(loadEvents());
      }, function(error) {
        throw new Error(res);
      });

    // clear the form values
    dispatch(reset('newEvent'));
  };
}
