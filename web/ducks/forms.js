'use strict';
import { reset } from 'redux-form';
import * as request from 'superagent-bluebird-promise';
import Immutable from 'immutable';
import { API_URL } from 'config';
import uuid from 'node-uuid';
import { push } from 'react-router-redux';
import { pick } from 'lodash';
import { initForm } from '../utils';

// define action types
export const LOAD = 'sc/forms/LOAD';
export const LOAD_SUCCESS = 'sc/forms/LOAD_SUCCESS';
export const LOAD_FAIL = 'sc/forms/LOAD_FAIL';

export const UPDATE_FORM = 'sc/forms/UPDATE_FORM';
export const UPDATE_FORM_NAME = 'sc/forms/UPDATE_FORM_NAME';
export const ADD_FORM = 'sc/forms/ADD_FORM';
export const ADD_FORM_ERROR = 'sc/forms/ADD_FORM_ERROR';
export const ADD_FIELD = 'sc/forms/ADD_FIELD';
export const CHANGE_REQUIRED_FIELD = 'sc/forms/CHANGE_REQUIRED_FIELD';
export const CHANGE_FIELD_NAME = 'sc/forms/CHANGE_FIELD_NAME';
export const CHANGE_FIELD_ORDER = 'sc/forms/CHANGE_FIELD_ORDER';
export const SWAP_FIELD_ORDER = 'sc/forms/SWAP_FIELD_ORDER';
export const UPDATE_FORM_VALUE = 'sc/forms/UPDATE_FORM_VALUE';
export const UPDATE_FIELD_OPTION = 'sc/forms/UPDATE_FIELD_OPTION';
export const UPDATE_ACTIVE_FIELD = 'sc/forms/UPDATE_ACTIVE_FIELD';
export const UPDATE_ACTIVE_FORM = 'sc/forms/UPDATE_ACTIVE_FORM';
export const UPDATE_SAVED_FORM = 'sc/forms/UPDATE_SAVED_FORM';
export const REMOVE_FIELD = 'sc/forms/REMOVE_FIELD';

// define an initialState
const initialState = Immutable.fromJS({
  loading: false,
  loaded: false,
  forms: {},
  saved_forms: {},
  activeForm: false, //field id
  addFormError: false
});

function form(state = Immutable.Map(), action) {
  switch (action.type) {
    case UPDATE_FORM_NAME:
      return state.set('form_label', action.newName);
    case UPDATE_FORM_VALUE:
      return state.set('value', Immutable.fromJS(action.value));
    case UPDATE_FIELD_OPTION:
      return state.set('fields', state.get('fields').update(
          state.get('fields').findIndex(f => f.get('id') === action.fieldId),
          f => f.set(action.option, action.value)
        )
      );
    case UPDATE_ACTIVE_FIELD:
      return state.set('activeField', action.fieldId);
    case ADD_FIELD:
       return state.set('fields', state.get('fields').push(Immutable.fromJS(action.field)));
    case SWAP_FIELD_ORDER:
      return state
        .set('fields', state.get('fields')
          .update(state.get('fields').findIndex(f => f.get('position') === action.indexOne), f => {
            return f.set('position', action.indexTwo);
          })
          .update(state.get('fields').findIndex(f => f.get('position') === action.indexTwo), f => {
            return f.set('position', action.indexOne);
          })
        );
    case REMOVE_FIELD:
      var fieldsPath = ['forms', action.formId.toString(), 'fields'];
      var fieldPath = ['fields', state.get('fields').findIndex(f => f.get('id') === action.fieldId)];
      var deletedFieldsPath = ['forms', action.formId.toString(), 'deletedFields'];
      let field = state.getIn(fieldPath);
      return state
        .set('fields', state.get('fields').update(fields => {
          //filter fields to remove fieldId
          return fields.filter(f => f.get('id') !== action.fieldId).map(f => {
            //update field orders to reflect removal
            if (f.get('position') > field.get('position')) {
              return f.set('position', f.get('position') - 1);
            }
            return f;
          });
        }))
        .set('deletedFields', state.get('deletedFields').push(action.fieldId));
    default:
      return state;
  }
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return state.set('loading', true);
    case LOAD_SUCCESS:
      return state
        .set('loading', false)
        .set('loaded', true)
        .set('forms', Immutable.fromJS(action.forms))
        .set('saved_forms', Immutable.fromJS(action.forms));
    case LOAD_FAIL:
      return state
        .set('loading', false)
        .set('loaded', false)
        .set('error', action.error);
    case ADD_FORM:
      return state
        .setIn(['forms', action.form.id.toString()], Immutable.fromJS(action.form))
    case ADD_FORM_ERROR:
      return state
        .set('addFormError', action.error)
    case UPDATE_ACTIVE_FORM:
      return state
        .set('activeForm', action.formId);
    case UPDATE_SAVED_FORM:
      return state
        .setIn(['saved_forms', action.formId.toString()], Immutable.fromJS(action.form));
    case UPDATE_FORM:
      return state
        .setIn(['forms', action.formId.toString()], Immutable.fromJS(action.newForm));
    case UPDATE_FORM_NAME:
    case UPDATE_FORM_VALUE:
    case UPDATE_FIELD_OPTION:
    case UPDATE_ACTIVE_FIELD:
    case ADD_FIELD:
    case SWAP_FIELD_ORDER:
    case REMOVE_FIELD:
      let formPath = ['forms', action.formId.toString()];
      return state.setIn(formPath, form(state.getIn(formPath), action));
    default: return state;
  }
}


// export the action creators (functions that return actions or functions)
export function updateForm(formId, newForm) {
  return {
    type: UPDATE_FORM,
    formId: formId,
    newForm: newForm
  };
}

export function addFormError(error) {
  return {
    type: ADD_FORM_ERROR,
    error: error
  };
}

export function updateFormName(formId, newName) {
  return {
    type: UPDATE_FORM_NAME,
    formId: formId,
    newName: newName
  };
}

export function updateFormValue(formId, value) {
  return {
    type: UPDATE_FORM_VALUE,
    formId: formId,
    value: value
  };
}

export function addField(payload) {
  return (dispatch, getState) => {
    const { sc } = getState();
    let position = sc.forms.getIn(['forms', payload.formId.toString(), 'fields']).size;
    let field = _.merge({
      id: position + 1,
      position: position,
      field_key: position + 1,
      field_label: payload.field_label
    }, payload.options);
    dispatch({
      type: ADD_FIELD,
      formId: payload.formId,
      field: field
    });
  }
}

export function updateFieldOption(formId, fieldId, option, value) {
  return {
    type: UPDATE_FIELD_OPTION,
    formId: formId,
    fieldId: fieldId,
    option: option,
    value: value
  };
}

export function swapFieldOrder(formId, indexOne, indexTwo) {
  return {
    type: SWAP_FIELD_ORDER,
    formId: formId,
    indexOne: indexOne,
    indexTwo: indexTwo
  };
}

export function updateActiveField(formId, fieldId) {
  return (dispatch) => {
    dispatch(updateActiveForm(false));
    dispatch({
      type: UPDATE_ACTIVE_FIELD,
      formId: formId,
      fieldId: fieldId
    });
  }
}

export function updateActiveForm(formId) {
  return {
    type: UPDATE_ACTIVE_FORM,
    formId: formId
  };
}

export function updateSavedForm(formId, form) {
  return {
    type: UPDATE_SAVED_FORM,
    formId: formId,
    form: form
  };
}

export function removeField(formId, fieldId) {
  return (dispatch) => {
    dispatch({
      type: REMOVE_FIELD,
      formId: formId,
      fieldId: fieldId
    });
    dispatch(updateActiveField(formId, null));
  };
}

export function receiveForms(forms) {
  let newForms = forms.map(initForm);
  let formMap = {};
  newForms.forEach(f => {
    formMap[f.id.toString()] = f;
  });
  return {
    type: LOAD_SUCCESS,
    forms: formMap
  };
}

export function receiveForm(form) {
  return {
    type: ADD_FORM,
    form: initForm(form)
  };
}

export function loadForms() {
  // When action creators return functions instead of plain action objects, they
  // are handled by the thunk middleware, which passes the dispatch method as
  // an argument to the function
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    dispatch({ type: LOAD });
    return request
      .get(API_URL + 'forms')
      .set('x-access-token', token)
      .then(res => {
        dispatch(receiveForms(res.body.result));
      })
      .catch(err => {
        throw new Error(err);
      })
  }
}

export function loadForm(form_key) {
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    dispatch({ type: LOAD });
    request
      .get(API_URL + 'forms/' + form_key)
      .set('x-access-token', token)
      .end(function(err, res) {
        if (err) {
          throw new Error(res);
        }
        dispatch(receiveForms([res.body.result]));
      });
  };
}

export function addForm(form) {
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    form.version = form.version + 1;
    let f = _.pick(form, ['form_key', 'form_label', 'version', 'fields']);
    return request
      .post(API_URL + 'forms')
      .set('x-access-token', token)
      .send(f)
      .then(function(res) {
        dispatch(updateSavedForm(res.body.result.id, res.body.result));
        dispatch(receiveForm(res.body.result));
        dispatch(addFormError(false));
      })
      .catch(error => {
        if (error.body.result.error.errors) {
          dispatch(addFormError(error.body.result.error.errors[0].message));
        } else {
          dispatch(addFormError(error.body.result.error));
        }
      })
  };
}

export function saveForm(form) {
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    form.version = form.version + 1;
    let f = _.pick(form, ['form_key', 'form_label', 'version', 'fields']);
    return request
      .post(API_URL + 'forms')
      .set('x-access-token', token)
      .send(f)
      .then(function(res) {
        dispatch(updateSavedForm(res.body.result.id, res.body.result));
        dispatch(receiveForms([res.body.result]));
      }, function(error) {
        throw new Error(res);
      });
  };
}

export function deleteForm(form_key) {
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    return request
      .delete(API_URL + 'forms/' + form_key)
      .set('x-access-token', token)
      .then(function(res) {
        dispatch(push('/forms'));
      }, function(error) {
        throw new Error(res);
      });
  };
}
