import jwtDecode from 'jwt-decode';
import * as request from 'superagent-bluebird-promise';
import { push } from 'react-router-redux';
import { API_URL } from 'config';

export const LOGIN_USER_REQUEST = 'sc/auth/LOGIN_USER_REQUEST';
export const LOGIN_USER_FAILURE = 'sc/auth/LOGIN_USER_FAILURE';
export const LOGIN_USER_SUCCESS = 'sc/auth/LOGIN_USER_SUCCESS';
export const SIGNUP_USER_REQUEST = 'sc/auth/SIGNUP_USER_REQUEST';
export const SIGNUP_USER_FAILURE = 'sc/auth/SIGNUP_USER_FAILURE';
export const SIGNUP_USER_SUCCESS = 'sc/auth/SIGNUP_USER_SUCCESS';
export const LOGOUT_USER = 'sc/auth/LOGOUT_USER';
export const FETCH_PROTECTED_DATA_REQUEST = 'sc/auth/FETCH_PROTECTED_DATA_REQUEST';
export const RECEIVE_PROTECTED_DATA = 'sc/auth/RECEIVE_PROTECTED_DATA';
export const CHANGE_TEAM = 'sc/auth/CHANGE_TEAM';

const initialState = {
  token: null,
  userName: null,
  isAuthenticated: false,
  isAuthenticating: false,
  statusText: null,
  isSigningUp: false,
  signUpError: null,
  signUpSuccess: false,
  selectedTeamId: null,
  teams: [],
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOGIN_USER_REQUEST:
      return {
        ...state,
        isAuthenticating: true,
        statusText: null,
      };
    case LOGIN_USER_SUCCESS:
      return {
        ...state,
        isAuthenticating: false,
        isAuthenticated: true,
        token: action.token,
        userName: jwtDecode(action.token).user.name,
        selectedTeamId: jwtDecode(action.token).user.teams[0].id, // select the first one by default
        teams: jwtDecode(action.token).user.teams,
        statusText: null,
      };
    case LOGIN_USER_FAILURE:
      return {
        ...state,
        isAuthenticating: false,
        isAuthenticated: false,
        token: null,
        userName: null,
        statusText: `Authentication failed: ${action.statusText}`,
      };
    case SIGNUP_USER_REQUEST:
      return {
        ...state,
        isSigningUp: true,
        signUpSuccess: false,
      };
    case SIGNUP_USER_FAILURE:
      return {
        ...state,
        isSigningUp: false,
        signUpError: action.error,
        signUpSuccess: false,
      };
    case SIGNUP_USER_SUCCESS:
      return {
        ...state,
        isSigningUp: false,
        signUpError: null,
        signUpSuccess: true,
      };
    case LOGOUT_USER:
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        userName: null,
        statusText: null,
      };
    case CHANGE_TEAM:
      return {
        ...state,
        selectedTeamId: action.payload.teamId,
      };
    default: return state;
  }
}

export function loginUserSuccess(token) {
  localStorage.setItem('token', token);
  return {
    type: LOGIN_USER_SUCCESS,
    token,
  };
}

export function loginUserFailure(error) {
  localStorage.removeItem('token');
  return {
    type: LOGIN_USER_FAILURE,
    statusText: error,
  };
}

export function signUpUserFailure(error) {
  return {
    type: SIGNUP_USER_FAILURE,
    error,
  };
}

export function signUpUserSuccess() {
  return {
    type: SIGNUP_USER_SUCCESS,
  };
}

export function loginUserRequest() {
  return {
    type: LOGIN_USER_REQUEST,
  };
}

export function signUpUserRequest() {
  return {
    type: SIGNUP_USER_REQUEST,
  };
}

export function logout() {
  localStorage.removeItem('token');
  return {
    type: LOGOUT_USER,
  };
}

export function logoutAndRedirect() {
  return (dispatch) => {
    dispatch(logout());
    dispatch(push('/login'));
  };
}

export function loginUser(email, password, redirect = '/') {
  return (dispatch) => {
    dispatch(loginUserRequest());
    return request
      .post(`${API_URL}authenticate`)
      .send({ email, password })
      .then((response) => {
        try {
          if (response.body.result.token) {
            dispatch(loginUserSuccess(response.body.result.token));
            dispatch(push(redirect));
          } else {
            dispatch(loginUserFailure(response.body.error.message));
          }
        } catch (e) {
          dispatch(loginUserFailure('Invalid token'));
        }
      })
      .catch((response) => {
        if (response.body.error.errors) {
          dispatch(loginUserFailure(response.body.error.errors[0].message));
        } else if (response.body.error.message) {
          dispatch(loginUserFailure(response.body.error.message));
        } else {
          dispatch(loginUserFailure('Login unsuccessful.'));
        }
      });
  };
}

export function signUpUser(name, email, password) {
  return (dispatch) => {
    dispatch(signUpUserRequest());
    return request
      .post(`${API_URL}users`)
      .send({ name, email, password })
      .then(() => dispatch(signUpUserSuccess()))
      .catch((response) => {
        if (response.body.error.errors) {
          dispatch(signUpUserFailure(response.body.error.errors[0].message));
        } else if (response.body.error.message) {
          dispatch(signUpUserFailure(response.body.error.message));
        } else {
          dispatch(signUpUserFailure('Sign Up unsuccessful.'));
        }
      });
  };
}

export function changeTeam(teamId) {
  return {
    type: CHANGE_TEAM,
    payload: {
      teamId: parseInt(teamId, 10),
    },
  };
}
