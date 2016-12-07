import * as request from 'superagent-bluebird-promise';
import { flatten, without, values } from 'lodash';
import { API_URL } from 'config';

export const LOAD_FORM_DATA_ALL = 'sc/data/LOAD_FORM_DATA_ALL';
export const ADD_FORM_ID = 'sc/data/ADD_FORM_ID';
export const REMOVE_FORM_ID = 'sc/data/REMOVE_FORM_ID';
export const LOAD_DEVICE_LOCATIONS = 'sc/data/LOAD_DEVICE_LOCATIONS';
export const TOGGLE_DEVICE_LOCATIONS = 'sc/data/TOGGLE_DEVICE_LOCATIONS';
export const TOGGLE_SPATIAL_TRIGGERS = 'sc/data/TOGGLE_SPATIAL_TRIGGERS';

const initialState = {
  formData: [],
  form_ids: [],
  device_locations: [],
  deviceLocationsOn: true,
  spatialTriggersOn: true,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_FORM_DATA_ALL:
      return {
        ...state,
        formData: action.payload.formData,
      };
    case ADD_FORM_ID:
      return {
        ...state,
        form_ids: state.form_ids.concat(action.payload.formId),
      };
    case REMOVE_FORM_ID:
      return {
        ...state,
        form_ids: without(state.form_ids, action.payload.formId),
      };
    case LOAD_DEVICE_LOCATIONS:
      return {
        ...state,
        device_locations: action.payload.device_locations,
      };
    case TOGGLE_DEVICE_LOCATIONS:
      return {
        ...state,
        deviceLocationsOn: action.payload.deviceLocationsOn,
      };
    case TOGGLE_SPATIAL_TRIGGERS:
      return {
        ...state,
        spatialTriggersOn: action.payload.spatialTriggersOn,
      };
    default: return state;
  }
}

export function addFormId(formId) {
  return {
    type: ADD_FORM_ID,
    payload: { formId },
  };
}

export function removeFormId(formId) {
  return {
    type: REMOVE_FORM_ID,
    payload: { formId },
  };
}

export function toggleDeviceLocations(deviceLocationsOn) {
  return {
    type: TOGGLE_DEVICE_LOCATIONS,
    payload: { deviceLocationsOn },
  };
}

export function toggleSpatialTriggers(spatialTriggersOn) {
  return {
    type: TOGGLE_SPATIAL_TRIGGERS,
    payload: { spatialTriggersOn },
  };
}

export function getFormData(form) {
  return (dispatch, getState) => {
    const { sc } = getState();
    const token = sc.auth.token;
    return request
      .get(`${API_URL}form/${form.id}/results`)
      .set('Authorization', `Token ${token}`)
      .then(res => res.body.result)
      .then(data => data.map((f) => {
        const _f = f;
        _f.form = form;
        return _f;
      }));
  };
}

export function loadFormDataAll() {
  return (dispatch, getState) => {
    const state = getState();
    const token = state.sc.auth.token;
    const forms = values(state.sc.forms.get('forms').toJS());
    return Promise.all(
      forms.map((form) => {
        dispatch(addFormId(form.id));
        return request
          .get(`${API_URL}form/${form.id}/results`)
          .set('Authorization', `Token ${token}`)
          .then(res => res.body.result)
          .then(data =>
            data.map(f => ({
              ...f,
              form_id: form.id,
              form_key: form.form_key,
            })),
          );
      }),
    )
    .then(formData => flatten(formData))
    .then((formData) => {
      dispatch({
        type: LOAD_FORM_DATA_ALL,
        payload: { formData },
      });
    });
  };
}

export function loadDeviceLocations() {
  return (dispatch, getState) => {
    const { sc } = getState();
    const token = sc.auth.token;
    return request
      .get(`${API_URL}locations`)
      .set('Authorization', `Token ${token}`)
      .then(res => res.body.result)
      .then((data) => {
        dispatch({
          type: LOAD_DEVICE_LOCATIONS,
          payload: { device_locations: data.features },
        });
      });
  };
}
