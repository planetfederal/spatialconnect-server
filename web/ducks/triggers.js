import * as request from 'superagent-bluebird-promise'
import { find, findIndex } from 'lodash';
import { API_URL } from 'config';

export const LOAD_SPATIAL_TRIGGERS = 'sc/triggers/LOAD_SPATIAL_TRIGGERS';
export const ADD_TRIGGER = 'sc/triggers/ADD_TRIGGER';
export const UPDATE_TRIGGER = 'sc/triggers/UPDATE_TRIGGER';
export const TRIGGER_ERRORS = 'sc/triggers/TRIGGER_ERRORS';

const geofence = {
  id: 1,
  name: 'Cupertino',
  type: 'geofence',
  geojson: {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'Polygon',
      'coordinates': [
        [
          [
            -122.04248428344727,
            37.33263104074124
          ],
          [
            -122.04248428344727,
            37.33774934661962
          ],
          [
            -122.03553199768068,
            37.33774934661962
          ],
          [
            -122.03553199768068,
            37.33263104074124
          ],
          [
            -122.04248428344727,
            37.33263104074124
          ]
        ]
      ]
    }
  }
};

const initialState = {
  spatial_triggers: [],
  errors: {}
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_SPATIAL_TRIGGERS:
      return {
        ...state,
        spatial_triggers: action.payload.spatial_triggers
      };
    case ADD_TRIGGER:
      return {
        ...state,
        spatial_triggers: state.spatial_triggers.concat(action.payload.trigger)
      };
    case UPDATE_TRIGGER:
      const idx = findIndex(state.spatial_triggers, { id: action.payload.trigger.id });
      console.log(idx);
      return {
        ...state,
        spatial_triggers: [
          ...state.spatial_triggers.slice(0, idx),
          action.payload.trigger,
          ...state.spatial_triggers.slice(idx + 1)
        ]
      };
    case TRIGGER_ERRORS:
      return {
        ...state,
        errors: action.payload.errors
      };
    default: return state;
  }
}

export function updateTriggerErrors(errors) {
  return {
    type: TRIGGER_ERRORS,
    payload: {
      errors: errors
    }
  };
}

export function updateTrigger(trigger) {
  return {
    type: UPDATE_TRIGGER,
    payload: { trigger }
  };
}

export function addTrigger(trigger) {
  return {
    type: ADD_TRIGGER,
    payload: {
      trigger: {
        ...trigger,
        id: 2
      }
    }
  };
}

export function receiveTriggers(triggers) {
  return {
    type: LOAD_SPATIAL_TRIGGERS,
    payload: {
      spatial_triggers: triggers
    }
  };
}

export function loadTrigger(triggerId) {
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    let trigger = find(sc.triggers.spatial_triggers, { id: +triggerId });
    if (trigger) {
      return dispatch(receiveTriggers([trigger]));
    } else {
      dispatch({
        type: LOAD_SPATIAL_TRIGGERS,
        payload: { spatial_triggers: [geofence] }
      });
      //dispatch({ type: LOAD });
      // return request
      //   .get(API_URL + 'triggers/' + triggerId)
      //   .set('x-access-token', token)
      //   .then(function(res) {
      //     return dispatch(receiveTriggers([res.body.result]));
      //   }, function(error) {
      //     //return dispatch({type: LOAD_FAIL, error: error});
      //   });
    }
  }
}

export function loadTriggers() {
  return (dispatch, getState) => {
    const { sc } = getState();
    let token = sc.auth.token;
    dispatch({
      type: LOAD_SPATIAL_TRIGGERS,
      payload: { spatial_triggers: [geofence] }
    });
  }
    // return request
    //   .get(API_URL + `triggers`)
    //   .set('x-access-token', token)
    //   .then(res => res.body.result)
    //   .then(data => {
    //     dispatch({
    //       type: LOAD_TRIGGERS,
    //       payload: { triggers: data }
    //     });
    //   })
    // }
}
