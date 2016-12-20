import * as request from 'superagent-bluebird-promise';
import { API_URL } from 'config';
import { push } from 'react-router-redux';
import { find, merge, keyBy, pick, omit } from 'lodash';
import { initForm } from '../utils';

// define action types
export const LOAD = 'sc/forms/LOAD';
export const LOAD_SUCCESS = 'sc/forms/LOAD_SUCCESS';
export const LOAD_FAIL = 'sc/forms/LOAD_FAIL';
export const UPDATE_FORM = 'sc/forms/UPDATE_FORM';
export const UPDATE_FORM_NAME = 'sc/forms/UPDATE_FORM_NAME';
export const ADD_FORM = 'sc/forms/ADD_FORM';
export const DELETE_FORM = 'sc/forms/DELETE_FORM';
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
const initialState = {
  loading: false,
  loaded: false,
  forms: {},
  saved_forms: {},
  activeForm: false, // field id
  addFormError: false,
};

const formReducer = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_FORM_NAME:
      return {
        ...state,
        form_label: action.newName,
      };
    case UPDATE_FORM_VALUE:
      return {
        ...state,
        value: action.value,
      };
    case UPDATE_FIELD_OPTION:
      return {
        ...state,
        fields: state.fields.map((field) => {
          if (field.id === action.fieldId) {
            return {
              ...field,
              [action.option]: action.value,
            };
          }
          return field;
        }),
      };
    case UPDATE_ACTIVE_FIELD:
      return {
        ...state,
        activeField: action.fieldId,
      };
    case ADD_FIELD:
      return {
        ...state,
        fields: state.fields.concat(action.field),
      };
    case SWAP_FIELD_ORDER:
      return {
        ...state,
        fields: state.fields.map((field) => {
          if (field.position === action.indexOne) {
            return {
              ...field,
              position: action.indexTwo,
            };
          }
          if (field.position === action.indexTwo) {
            return {
              ...field,
              position: action.indexOne,
            };
          }
          return field;
        }),
      };
    case REMOVE_FIELD: {
      const fieldToRemove = find(state.fields, { id: action.fieldId });
      return {
        ...state,
        fields: state.fields.filter(field => field.id !== action.fieldId)
          .map((field) => {
            if (field.position > fieldToRemove.position) {
              return { ...field, position: field.position - 1 };
            }
            return field;
          }),
        deletedFields: state.deletedFields.concat(action.fieldId),
      };
    }
    default:
      return state;
  }
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true,
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        forms: action.forms,
        saved_forms: action.forms,
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error,
      };
    case ADD_FORM:
      return {
        ...state,
        forms: {
          ...state.forms,
          [action.form.form_key]: action.form,
        },
      };
    case DELETE_FORM:
      return {
        ...state,
        forms: omit(state.forms, action.form_key),
      };
    case ADD_FORM_ERROR:
      return {
        ...state,
        addFormError: action.error,
      };
    case UPDATE_ACTIVE_FORM:
      return {
        ...state,
        activeForm: action.form_key,
      };
    case UPDATE_SAVED_FORM:
      return {
        ...state,
        saved_forms: {
          ...state.saved_forms,
          [action.form_key]: action.form,
        },
      };
    case UPDATE_FORM:
      return {
        ...state,
        forms: {
          ...state.forms,
          [action.form_key]: action.newForm,
        },
      };
    case UPDATE_FORM_NAME:
    case UPDATE_FORM_VALUE:
    case UPDATE_FIELD_OPTION:
    case UPDATE_ACTIVE_FIELD:
    case ADD_FIELD:
    case SWAP_FIELD_ORDER:
    case REMOVE_FIELD: {
      const formToUpdate = state.forms[action.form_key];
      return {
        ...state,
        forms: {
          ...state.forms,
          [action.form_key]: formReducer(formToUpdate, action),
        },
      };
    }
    default: return state;
  }
}

// export the action creators (functions that return actions or functions)
export function updateForm(form_key, newForm) {
  return {
    type: UPDATE_FORM,
    form_key,
    newForm,
  };
}

export function addFormError(error) {
  return {
    type: ADD_FORM_ERROR,
    error,
  };
}

export function updateFormName(form_key, newName) {
  return {
    type: UPDATE_FORM_NAME,
    form_key,
    newName,
  };
}

export function updateFormValue(form_key, value) {
  return {
    type: UPDATE_FORM_VALUE,
    form_key,
    value,
  };
}

export function addField(payload) {
  return (dispatch, getState) => {
    const { sc } = getState();
    const position = sc.forms.forms[payload.form_key].fields.length;
    const field = merge({
      id: position + 1,
      position,
      field_key: `field_${position + 1}`,
      field_label: payload.field_label,
    }, payload.options);
    dispatch({
      type: ADD_FIELD,
      form_key: payload.form_key,
      field,
    });
    dispatch({
      type: UPDATE_ACTIVE_FIELD,
      form_key: payload.form_key,
      fieldId: field.id,
    });
  };
}

export function updateFieldOption(form_key, fieldId, option, value) {
  return {
    type: UPDATE_FIELD_OPTION,
    form_key,
    fieldId,
    option,
    value,
  };
}

export function swapFieldOrder(form_key, indexOne, indexTwo) {
  return {
    type: SWAP_FIELD_ORDER,
    form_key,
    indexOne,
    indexTwo,
  };
}

export function updateActiveForm(form_key) {
  return {
    type: UPDATE_ACTIVE_FORM,
    form_key,
  };
}

export function updateActiveField(form_key, fieldId) {
  return (dispatch) => {
    dispatch(updateActiveForm(false));
    dispatch({
      type: UPDATE_ACTIVE_FIELD,
      form_key,
      fieldId,
    });
  };
}

export function updateSavedForm(form_key, form) {
  return {
    type: UPDATE_SAVED_FORM,
    form_key,
    form,
  };
}

export function removeField(form_key, fieldId) {
  return (dispatch) => {
    dispatch({
      type: REMOVE_FIELD,
      form_key,
      fieldId,
    });
    dispatch(updateActiveField(form_key, null));
  };
}

export function receiveForms(forms) {
  return (dispatch, getState) => {
    const { sc } = getState();
    dispatch({
      type: LOAD_SUCCESS,
      forms: keyBy(forms.map(initForm(sc.auth.teams)), 'form_key'),
    });
  };
}

export function receiveForm(form) {
  return (dispatch, getState) => {
    const { sc } = getState();
    dispatch({
      type: ADD_FORM,
      form: initForm(sc.auth.teams)(form),
    });
  };
}

export function loadForms() {
  // When action creators return functions instead of plain action objects, they
  // are handled by the thunk middleware, which passes the dispatch method as
  // an argument to the function
  return (dispatch, getState) => {
    const { sc } = getState();
    const token = sc.auth.token;
    dispatch({ type: LOAD });
    return request
      .get(`${API_URL}forms`)
      .set('Authorization', `Token ${token}`)
      .then((res) => {
        dispatch(receiveForms(res.body.result));
      })
      .catch((err) => {
        throw new Error(err);
      });
  };
}

export function loadForm(form_key) {
  return (dispatch, getState) => {
    const { sc } = getState();
    const token = sc.auth.token;
    dispatch({ type: LOAD });
    request
      .get(`${API_URL}forms/${form_key}`)
      .set('Authorization', `Token ${token}`)
      .end((err, res) => {
        if (err) {
          throw new Error(res);
        }
        dispatch(receiveForm(res.body.result));
      });
  };
}

export function addForm(form) {
  return (dispatch, getState) => {
    const { sc } = getState();
    const token = sc.auth.token;
    const newForm = {
      ...form,
      team_id: sc.auth.selectedTeamId,
    };
    const f = pick(newForm, ['form_key', 'form_label', 'version', 'fields', 'team_id']);
    return request
      .post(`${API_URL}forms`)
      .set('Authorization', `Token ${token}`)
      .send(f)
      .then((res) => {
        dispatch(updateSavedForm(res.body.result.form_key, res.body.result));
        dispatch(receiveForm(res.body.result));
        dispatch(addFormError(false));
      })
      .catch((error) => {
        if (error.body.error.errors) {
          dispatch(addFormError(error.body.error.errors[0].message));
        } else {
          dispatch(addFormError(error.body.error));
        }
      });
  };
}

export function saveForm(form) {
  return (dispatch, getState) => {
    const { sc } = getState();
    const token = sc.auth.token;
    const newForm = {
      ...form,
      team_id: sc.auth.selectedTeamId,
    };
    const f = pick(newForm, ['form_key', 'form_label', 'version', 'fields', 'team_id']);
    return request
      .post(`${API_URL}forms`)
      .set('Authorization', `Token ${token}`)
      .send(f)
      .then((res) => {
        dispatch(updateSavedForm(res.body.result.form_key, res.body.result));
        dispatch(receiveForm(res.body.result));
      });
  };
}

export function deleteForm(form_key) {
  return (dispatch, getState) => {
    const { sc } = getState();
    const token = sc.auth.token;
    return request
      .delete(`${API_URL}forms/${form_key}`)
      .set('Authorization', `Token ${token}`)
      .then(() => {
        dispatch({
          type: DELETE_FORM,
          form_key,
        });
        dispatch(push('/forms'));
      });
  };
}
