import jwtDecode from 'jwt-decode';
import * as request from 'superagent-bluebird-promise'
import { push } from 'react-router-redux'
import { checkHttpStatus } from '../utils';
import { API_URL } from 'config';

export const LOGIN_USER_REQUEST = 'sc/auth/LOGIN_USER_REQUEST';
export const LOGIN_USER_FAILURE = 'sc/auth/LOGIN_USER_FAILURE';
export const LOGIN_USER_SUCCESS = 'sc/auth/LOGIN_USER_SUCCESS';
export const LOGOUT_USER = 'sc/auth/LOGOUT_USER';
export const FETCH_PROTECTED_DATA_REQUEST = 'sc/auth/FETCH_PROTECTED_DATA_REQUEST';
export const RECEIVE_PROTECTED_DATA = 'sc/auth/RECEIVE_PROTECTED_DATA';

const initialState = {
  token: null,
  userName: null,
  isAuthenticated: false,
  isAuthenticating: false,
  statusText: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOGIN_USER_REQUEST:
      return {
        ...state,
        isAuthenticating: true,
        statusText: null
      };
    case LOGIN_USER_SUCCESS:
      return {
        ...state,
        isAuthenticating: false,
        isAuthenticated: true,
        token: action.token,
        userName: jwtDecode(action.token).userName,
        statusText: 'You have been successfully logged in.'
      };
    case LOGIN_USER_FAILURE:
      return {
        ...state,
        isAuthenticating: false,
        isAuthenticated: false,
        token: null,
        userName: null,
        statusText: `${action.statusText}`
      };
    case LOGOUT_USER:
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        userName: null,
        statusText: null
      };
    default: return state;
  }
}

export function loginUserSuccess(token) {
  localStorage.setItem('token', token);
  return {
    type: LOGIN_USER_SUCCESS,
    token: token
  };
}

export function loginUserFailure(error) {
  localStorage.removeItem('token');
  return {
    type: LOGIN_USER_FAILURE,
    status: error.response.status,
    statusText: error.response.statusText
  };
}

export function loginUserRequest() {
  return {
    type: LOGIN_USER_REQUEST
  };
}

export function logout() {
  localStorage.removeItem('token');
  return {
    type: LOGOUT_USER
  };
}

export function logoutAndRedirect() {
  return (dispatch, state) => {
    dispatch(logout());
    dispatch(push('/'));
  };
}

export function loginUser(email, password, redirect="/") {
  return dispatch => {
    dispatch(loginUserRequest());
    return request
      .post(API_URL + 'authenticate')
      .send({email: email, password: password})
      .then(response => {
        try {
          if (response.body.success) {
            let decoded = jwtDecode(response.body.token);
            dispatch(loginUserSuccess(response.body.token));
            dispatch(push(redirect));
          } else {
            dispatch(loginUserFailure({
              response: {
                status: 403,
                statusText: response.body.message
              }
            }));
          }
        } catch (e) {
          dispatch(loginUserFailure({
            response: {
              status: 403,
              statusText: 'Invalid token'
            }
          }));
        }
      })
      .catch(error => {
        dispatch(loginUserFailure(error));
      })
  }
}

