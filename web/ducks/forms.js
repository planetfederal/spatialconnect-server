'use strict';
import { reset } from 'redux-form';
import * as request from 'superagent-bluebird-promise';
import Immutable from 'immutable';
import { API_URL } from 'config';
import uuid from 'node-uuid';
import { push } from 'react-router-redux';
import { pick } from 'lodash';

// define action types
export const LOAD = 'sc/forms/LOAD';
export const LOAD_SUCCESS = 'sc/forms/LOAD_SUCCESS';
export const LOAD_FAIL = 'sc/forms/LOAD_FAIL';

export const UPDATE_FORM = 'sc/forms/UPDATE_FORM';
export const UPDATE_FORM_NAME = 'sc/forms/UPDATE_FORM_NAME';
export const ADD_FORM = 'sc/forms/ADD_FORM';
export const ADD_FIELD = 'sc/forms/ADD_FIELD';
export const CHANGE_REQUIRED_FIELD = 'sc/forms/CHANGE_REQUIRED_FIELD';
export const CHANGE_FIELD_NAME = 'sc/forms/CHANGE_FIELD_NAME';
export const CHANGE_FIELD_ORDER = 'sc/forms/CHANGE_FIELD_ORDER';
export const SWAP_FIELD_ORDER = 'sc/forms/SWAP_FIELD_ORDER';
export const UPDATE_FORM_VALUE = 'sc/forms/UPDATE_FORM_VALUE';
export const UPDATE_FIELD_OPTION = 'sc/forms/UPDATE_FIELD_OPTION';
export const UPDATE_ACTIVE_FIELD = 'sc/forms/UPDATE_ACTIVE_FIELD';
export const UPDATE_ACTIVE_FORM = 'sc/forms/UPDATE_ACTIVE_FORM';
export const REMOVE_FIELD = 'sc/forms/REMOVE_FIELD';

// define an initialState
const initialState = Immutable.fromJS({
  loading: false,
  loaded: false,
  forms: [],
  activeForm: false //field id
});

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return state.set('loading', true);
    case LOAD_SUCCESS:
      return state
        .set('loading', false)
        .set('loaded', true)
        .set('forms', Immutable.fromJS(action.forms));
    case LOAD_FAIL:
      return state
        .set('loading', false)
        .set('loaded', false)
        .set('error', action.error);
    case UPDATE_FORM:
      return state
        .setIn(['forms', action.formId.toString()], Immutable.fromJS(action.newForm));
    case UPDATE_FORM_NAME:
      return state
        .setIn(['forms', action.formId.toString(), 'name'], action.newName);
    case UPDATE_FORM_VALUE:
      return state
        .setIn(['forms', action.formId.toString(), 'value'], Immutable.fromJS(action.value));
    case UPDATE_FIELD_OPTION:
      var fieldsPath = ['forms', action.formId.toString(), 'fields'];
      return state
        .setIn(fieldsPath, state.getIn(fieldsPath).update(
            state.getIn(fieldsPath).findIndex(f => f.get('id') === action.fieldId),
            f => f.set(action.option, action.value)
          )
        );
    case UPDATE_ACTIVE_FIELD:
      return state
        .setIn(['forms', action.formId.toString(), 'activeField'], action.fieldId);
    case UPDATE_ACTIVE_FORM:
      return state
        .set('activeForm', action.formId);
    case ADD_FIELD:
      var fieldsPath = ['forms', action.formId.toString(), 'fields'];
      return state
        .setIn(fieldsPath, state.getIn(fieldsPath).push(Immutable.fromJS(action.field)));
    case SWAP_FIELD_ORDER:
      var fieldsPath = ['forms', action.formId.toString(), 'fields'];
      return state
        .setIn(fieldsPath, state.getIn(fieldsPath)
          .update(state.getIn(fieldsPath).findIndex(f => f.get('position') === action.indexOne), f => {
            return f.set('position', action.indexTwo);
          })
          .update(state.getIn(fieldsPath).findIndex(f => f.get('position') === action.indexTwo), f => {
            return f.set('position', action.indexOne);
          })
        );
    case REMOVE_FIELD:
      var fieldsPath = ['forms', action.formId.toString(), 'fields'];
      var fieldPath = ['forms', action.formId.toString(), 'fields', state.getIn(fieldsPath).findIndex(f => f.get('id') === action.fieldId)];
      var deletedFieldsPath = ['forms', action.formId.toString(), 'deletedFields'];
      let field = state.getIn(fieldPath);
      return state
        .setIn(fieldsPath, state.getIn(fieldsPath).update(fields => {
          //filter fields to remove fieldId
          return fields.filter(f => f.get('id') !== action.fieldId).map(f => {
            //update field orders to reflect removal
            if (f.get('position') > field.get('position')) {
              return f.set('position', f.get('position') - 1);
            }
            return f;
          });
        }))
        .setIn(deletedFieldsPath, state.getIn(deletedFieldsPath).push(action.fieldId));
    // return the previousState if no actions match
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
      id: uuid.v1(),
      position: position,
      key: payload.key,
      name: payload.name
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
  //make form order and initial form value
  forms = forms.map(f => {
    f.value = {};
    f.deletedFields = [];
    f.fields.forEach(field => {
      if (field.hasOwnProperty('initialValue')) {
        f.value[field.key] = field.initialValue;
      }
    });
    return f;
  })
  //convert list of forms to map
  let formMap = {};
  forms.forEach(f => {
    formMap[f.id.toString()] = f;
  });
  return {
    type: LOAD_SUCCESS,
    forms: formMap
  };
}

export function loadForms() {
  // When action creators return functions instead of plain action objects, they
  // are handled by the thunk middleware, which passes the dispatch method as
  // an argument to the function
  return dispatch => {
    dispatch({ type: LOAD });
    request
      .get(API_URL + 'forms')
      .end(function(err, res) {
        if (err) {
          throw new Error(res);
        }
        dispatch(receiveForms(res.body));
      });
  }
}

export function loadForm(id) {
  return (dispatch, getState) => {
    const { sc } = getState();
    //load from cache
    if (sc.forms.getIn(['forms', id.toString()], null) !== null) {
      dispatch(
        receiveForms([sc.forms.getIn(['forms', id.toString()]).toJS()])
      );
    } else {
      dispatch({ type: LOAD });
      request
        .get(API_URL + 'forms/' + id)
        .end(function(err, res) {
          if (err) {
            throw new Error(res);
          }
          dispatch(receiveForms([res.body]));
        });
    }
  };
}

export function addForm() {
  return dispatch => {
    let data = {
      name: 'New Form'
    };
    return request
      .post(API_URL + 'forms')
      .send(data)
      .end(function(err, res) {
        if (err) {
          throw new Error(res);
        }
        dispatch(updateActiveForm(res.body.id));
        dispatch(updateForm(res.body.id, res.body));
        dispatch(push('/forms/' + res.body.id));
      });
  };
}

export function saveForm(formId) {
  return (dispatch, getState) => {
    const { sc } = getState();
    let form = sc.forms.getIn(['forms', formId.toString()]).toJS()
    let data = {
      form: _.pick(form, ['name', 'fields']),
      deletedFields: form.deletedFields
    }
    return request
      .put(API_URL + 'forms/' + formId)
      .send(data)
      .then(function(res) {
        //TODO confirm form save in UI
      }, function(error) {
        throw new Error(res);
      });
  };
}

export function deleteForm(formId) {
  return dispatch => {
    return request
      .delete(API_URL + 'forms/' + formId)
      .then(function(res) {
        dispatch(push('/forms'));
      }, function(error) {
        throw new Error(res);
      });
  };
}

export function submitNewForm(data) {
  return dispatch => {
    request
      .post(API_URL + 'forms')
      .send(data)
      .end(function(err, res) {
        if (err) {
          throw new Error(res);
        }
        dispatch(loadForms());
      });

    // clear the form values
    dispatch(reset('newForm'));
  };
}
