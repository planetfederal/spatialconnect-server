import * as request from 'superagent-bluebird-promise'
import { push } from 'react-router-redux'
import { checkHttpStatus } from '../utils';
import { flatten, without, values } from 'lodash';
import { API_URL } from 'config';
import { formActions } from './forms';

export const LOAD_FORM_DATA_ALL = 'sc/data/LOAD_FORM_DATA_ALL';
export const ADD_FORM_ID = 'sc/data/ADD_FORM_ID';
export const REMOVE_FORM_ID = 'sc/data/REMOVE_FORM_ID';
export const LOAD_DEVICE_LOCATIONS = 'sc/data/LOAD_DEVICE_LOCATIONS';
export const TOGGLE_DEVICE_LOCATIONS = 'sc/data/TOGGLE_DEVICE_LOCATIONS';
export const TOGGLE_SPATIAL_TRIGGERS = 'sc/data/TOGGLE_SPATIAL_TRIGGERS';

const initialState = {
  form_data: [],
  form_ids: [],
  device_locations: [],
  device_locations_on: true,
  spatial_triggers_on: true
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_FORM_DATA_ALL:
      return {
        ...state,
        form_data: action.payload.form_data
      };
    case ADD_FORM_ID:
      return {
        ...state,
        form_ids: state.form_ids.concat(action.payload.form_id)
      };
    case REMOVE_FORM_ID:
      return {
        ...state,
        form_ids: without(state.form_ids, action.payload.form_id)
      };
    case LOAD_DEVICE_LOCATIONS:
      return {
        ...state,
        device_locations: action.payload.device_locations,
      };
    case TOGGLE_DEVICE_LOCATIONS:
      return {
        ...state,
        device_locations_on: action.payload.device_locations_on,
      };
    case TOGGLE_SPATIAL_TRIGGERS:
      return {
        ...state,
        spatial_triggers_on: action.payload.spatial_triggers_on,
      };
    default: return state;
  }
}

export function addFormId(form_id) {
  return {
    type: ADD_FORM_ID,
    payload: { form_id: form_id }
  };
}

export function removeFormId(form_id) {
  return {
    type: REMOVE_FORM_ID,
    payload: { form_id: form_id }
  };
}

export function toggleDeviceLocations(device_locations_on) {
  return {
    type: TOGGLE_DEVICE_LOCATIONS,
    payload: { device_locations_on }
  };
}

export function toggleSpatialTriggers(spatial_triggers_on) {
  return {
    type: TOGGLE_SPATIAL_TRIGGERS,
    payload: { spatial_triggers_on }
  };
}

export function getFormData(form) {
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    return request
      .get(API_URL + `form/${form.id}/results`)
      .set('x-access-token', token)
      .then(res => res.body.result)
      .then(data => data.map(f => {
        f.form = form;
        return f;
      }))
    }
}

export function loadFormDataAll() {
  return (dispatch, getState) => {
    const state = getState();
    let token = state.sc.auth.token;
    let forms = values(state.sc.forms.get('forms').toJS());
    return Promise.all(
      forms.map(form => {
        dispatch(addFormId(form.id));
        return request
          .get(API_URL + `forms/${form.id}/results`)
          .set('x-access-token', token)
          .then(res => res.body.result)
          .then(function(form, data) {
            return data.map(f => {
              f.form_id = form.id;
              return f;
            });
          }.bind(this, form))
      })
    )
    .then(form_data =>  _.flatten(form_data))
    .then(form_data => {
      dispatch({
        type: LOAD_FORM_DATA_ALL,
        payload: { form_data: form_data }
      });
    });
  }
}

export function loadDeviceLocations() {
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    return request
      .get(API_URL + `locations`)
      .set('x-access-token', token)
      .then(res => res.body.result)
      .then(data => {
        console.log(data);
        dispatch({
          type: LOAD_DEVICE_LOCATIONS,
          payload: { device_locations: data.features }
        });
      })
    }
}
