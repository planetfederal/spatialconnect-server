import * as request from 'superagent-bluebird-promise';
import { API_URL } from 'config';
import { push } from 'react-router-redux';
import find from 'lodash/find';
import * as authActions from './auth';

export const LOAD = 'sc/auth/LOAD';
export const LOAD_TEAMS = 'sc/auth/LOAD_TEAMS';
export const LOAD_TEAM = 'sc/auth/LOAD_TEAM';
export const LOAD_FAIL = 'sc/auth/LOAD_FAIL';
export const CREATE_FAIL = 'sc/auth/CREATE_FAIL';
export const TOGGLE_ADDING_TEAM = 'sc/auth/TOGGLE_ADDING_TEAM';

const initialState = {
  teams: [],
  loading: false,
  loaded: false,
  error: false,
  addTeamError: false,
  addingTeam: false,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true,
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.payload.error,
      };
    case LOAD_TEAMS:
      return {
        ...state,
        loading: false,
        loaded: true,
        error: null,
        teams: action.payload.teams,
      };
    case LOAD_TEAM:
      return {
        ...state,
        teams: state.teams.concat(action.payload.team),
      };
    case CREATE_FAIL:
      return {
        ...state,
        addTeamError: action.payload.error,
      };
    case TOGGLE_ADDING_TEAM:
      return {
        ...state,
        addingTeam: !state.addingTeam,
        addTeamError: false,
      };
    default: return state;
  }
}

export function addTeamToggle() {
  return {
    type: TOGGLE_ADDING_TEAM,
  };
}

export function loadTeams() {
  return (dispatch, getState) => {
    const { sc } = getState();
    const token = sc.auth.token;
    dispatch({ type: LOAD });
    return request
      .get(`${API_URL}teams`)
      .set('Authorization', `Token ${token}`)
      .then(
        res => dispatch({ type: LOAD_TEAMS, payload: { teams: res.body.result } }),
        error => dispatch({ type: LOAD_FAIL, error }),
      );
  };
}

export function loadTeam(id) {
  return (dispatch, getState) => {
    const { sc } = getState();
    const token = sc.auth.token;
    dispatch({ type: LOAD });
    return request
      .get(`${API_URL}teams/${id}`)
      .set('Authorization', `Token ${token}`)
      .then(
        res => dispatch({ type: LOAD_TEAM, payload: { team: res.body.result } }),
        error => dispatch({ type: LOAD_FAIL, error }),
      );
  };
}

export function createTeam(team) {
  return (dispatch, getState) => {
    const { sc } = getState();
    const token = sc.auth.token;
    const newTeam = {
      ...team,
      organization_id: 1,
    };
    return request
      .post(`${API_URL}teams`)
      .set('Authorization', `Token ${token}`)
      .send(newTeam)
      .then(
        () => {
          dispatch(loadTeams());
          dispatch(addTeamToggle());
        },
        error => dispatch({ type: CREATE_FAIL, payload: { error: error.message } }),
      );
  };
}

export function addUserTeam(teamId) {
  return (dispatch, getState) => {
    const { sc } = getState();
    const token = sc.auth.token;
    const userId = sc.auth.userID;
    const team = find(sc.teams.teams, { id: teamId });
    return request
      .post(`${API_URL}user-team`)
      .set('Authorization', `Token ${token}`)
      .send({ userId, teamId })
      .then(
        () => {
          dispatch(authActions.joinTeam(team));
          return dispatch(loadTeams());
        });
  };
}

export function removeUserTeam(teamId) {
  return (dispatch, getState) => {
    const { sc } = getState();
    const token = sc.auth.token;
    const userId = sc.auth.userID;
    const team = find(sc.teams.teams, { id: teamId });
    return request
      .delete(`${API_URL}user-team`)
      .set('Authorization', `Token ${token}`)
      .send({ userId, teamId })
      .then(
        () => {
          dispatch(authActions.leaveTeam(team));
          return dispatch(loadTeams());
        });
  };
}

export function deleteTeam(teamId) {
  return (dispatch, getState) => {
    const { sc } = getState();
    const token = sc.auth.token;
    return request
      .delete(`${API_URL}teams/${teamId}`)
      .set('Authorization', `Token ${token}`)
      .then(
        () => {
          dispatch(loadTeams());
          return dispatch(push('/teams'));
        });
  };
}
