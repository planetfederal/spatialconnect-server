import * as request from 'superagent-bluebird-promise'
import { find, findIndex } from 'lodash';
import { push } from 'react-router-redux';
import { API_URL } from 'config';

export const LOAD_SPATIAL_TRIGGERS = 'sc/triggers/LOAD_SPATIAL_TRIGGERS';
export const ADD_TRIGGER = 'sc/triggers/ADD_TRIGGER';
export const UPDATE_TRIGGER = 'sc/triggers/UPDATE_TRIGGER';
export const TRIGGER_ERRORS = 'sc/triggers/TRIGGER_ERRORS';

const initialState = {
  spatial_triggers: [],
  errors: {}
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_SPATIAL_TRIGGERS:
      return {
        ...state,
        spatial_triggers: action.payload.spatial_triggers
      };
    case ADD_TRIGGER:
      return {
        ...state,
        spatial_triggers: state.spatial_triggers.concat(action.payload.trigger)
      };
    case UPDATE_TRIGGER:
      const idx = findIndex(state.spatial_triggers, { id: action.payload.trigger.id });
      return {
        ...state,
        spatial_triggers: [
          ...state.spatial_triggers.slice(0, idx),
          action.payload.trigger,
          ...state.spatial_triggers.slice(idx + 1)
        ]
      };
    case TRIGGER_ERRORS:
      return {
        ...state,
        errors: action.payload.errors
      };
    default: return state;
  }
}

export function updateTriggerErrors(errors) {
  return {
    type: TRIGGER_ERRORS,
    payload: {
      errors: errors
    }
  };
}

export function updateTrigger(trigger) {
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    return request
      .put(API_URL + 'triggers')
      .set('Authorization', 'Token ' + token)
      .send(trigger)
      .then(
        res => dispatch(loadTrigger(trigger.id, true)),
        err => dispatch(updateTriggerErrors(err))
      );
  };
}

export function addTrigger(trigger) {
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    return request
      .post(API_URL + 'triggers')
      .set('Authorization', 'Token ' + token)
      .send(trigger)
      .then(
        res => dispatch(loadTriggers()),
        err => dispatch(updateTriggerErrors(err))
      );
  };
}

export function receiveTriggers(triggers) {
  return {
    type: LOAD_SPATIAL_TRIGGERS,
    payload: {
      spatial_triggers: triggers
    }
  };
}

export function deleteTrigger(trigger) {
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    return request
      .delete(API_URL + 'triggers/' + trigger.id)
      .set('Authorization', 'Token ' + token)
      .then(() => dispatch(push('/triggers')));
  };
}


export function loadTrigger(triggerId, refresh=false) {
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    return request
      .get(API_URL + 'triggers/' + triggerId)
      .set('Authorization', 'Token ' + token)
      .then(res => res.body.result)
      .then(data => dispatch(receiveTriggers([data])));
  }
}

export function loadTriggers() {
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    return request
      .get(API_URL + `triggers`)
      .set('Authorization', 'Token ' + token)
      .then(res => res.body.result)
      .then(data => dispatch(receiveTriggers(data)));
  }
}
