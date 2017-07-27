import * as request from 'superagent-bluebird-promise';
import { API_URL } from 'config';

export const SEND = 'sc/messages/SEND';
export const SEND_FAIL = 'sc/messages/SEND_FAIL';
export const SEND_SUCCESS = 'sc/messages/SEND_SUCCESS';
export const SEND_CANCEL = 'sc/messages/SEND_CANCEL';
export const SEND_ALL = 'sc/messages/SEND_ALL';

const initialState = {
  error: false,
  success: false,
  sending: false,
  sendAll: false,
};

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case SEND: {
      return {
        ...state,
        sending: true,
        error: false,
        success: false,
      };
    }
    case SEND_FAIL: {
      return {
        ...state,
        error: action.error,
        success: false,
        sending: false,
      };
    }
    case SEND_SUCCESS: {
      return {
        ...state,
        success: true,
        error: false,
        sending: false,
      };
    }
    case SEND_CANCEL: {
      return {
        ...state,
        success: false,
        error: false,
        sending: false,
        sendAll: false,
      };
    }
    case SEND_ALL: {
      return {
        ...state,
        sendAll: true,
      };
    }
  }
  return state;
}

export function sendAll() {
  return {
    type: SEND_ALL,
  };
}

export function cancel() {
  return {
    type: SEND_CANCEL,
  };
}

export function sendNotification(notification) {
  return (dispatch, getState) => {
    const { sc } = getState();
    const token = sc.auth.token;
    const body = { notification };
    dispatch({ type: SEND });
    return request
      .post(`${API_URL}notifications`)
      .set('Authorization', `Token ${token}`)
      .send(body)
      .then(
        res => {
          dispatch({ type: SEND_SUCCESS });
        },
        error => {
          dispatch({ type: SEND_FAIL, error });
        }
      );
  };
}
