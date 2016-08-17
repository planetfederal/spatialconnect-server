import * as request from 'superagent-bluebird-promise'
import { push } from 'react-router-redux'
import { checkHttpStatus } from '../utils';
import { flatten, without } from 'lodash';
import { API_URL } from 'config';

export const LOAD_FORM_DATA_ALL = 'sc/auth/LOAD_FORM_DATA_ALL';
export const ADD_FORM_ID = 'sc/auth/ADD_FORM_ID';
export const REMOVE_FORM_ID = 'sc/auth/REMOVE_FORM_ID';

const initialState = {
  form_data: [],
  form_ids: [],
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

export function getFormData(form) {
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    return request
      .get(API_URL + `form/${form.id}/results`)
      .set('x-access-token', token)
      .then(res => res.body)
      .then(data => data.map(f => {
        f.form = form;
        return f;
      }))
    }
}

export function loadFormDataAll() {
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    return request
      .get(API_URL + 'forms')
      .set('x-access-token', token)
      .then(res => res.body)
      .then(forms => {
        return Promise.all(
          forms.map(form => {
            dispatch(addFormId(form.id));
            return request
              .get(API_URL + `forms/${form.id}/results`)
              .set('x-access-token', token)
              .then(res => res.body)
              .then(data => data.map(f => {
                f.form = form;
                return f;
              }))
          })
        );
      })
      .then(form_data =>  _.flatten(form_data))
      .then(form_data => {
        dispatch({
          type: LOAD_FORM_DATA_ALL,
          payload: { form_data: form_data }
        });
      });
  }
}