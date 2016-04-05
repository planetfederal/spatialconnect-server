'use strict';
import expect from 'expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import deepFreeze from 'deep-freeze';
import sinon from 'sinon';
import * as events from '../ducks/events';
import reducer from '../ducks/events';
import mockEvents from './data/mockEvents';
import { API_URL } from 'config';

// test the action creators that return an object
describe('events action creators', () => {
  it('should create an action that receives events', () => {
    const expectedAction = {
      type: events.LOAD_SUCCESS,
      events: mockEvents
    };
    expect(events.receiveEvents(mockEvents)).toEqual(expectedAction);
  });
  it('should create an action for when the "add new event button" is clicked',
    () => {
      const expectedAction = {
        type: events.ADD_NEW_EVENT_CLICKED,
      };
      expect(events.addNewEventClicked()).toEqual(expectedAction);
    });
});

// test the async action creators that return functions
const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);

describe('events async action creators', () => {

  before(function() {
    this.server = sinon.fakeServer.create();
    this.server.autoRespond = true
    this.server.respondWith('GET', API_URL + 'events',
      [200, { 'Content-Type': 'application/json' }, JSON.stringify(mockEvents)]
    );
    this.server.respondWith('POST', API_URL + 'events',
      [200, { 'Content-Type': 'application/json' }, JSON.stringify(mockEvents)]
    );
  });

  after(function() {
    this.server.restore();
  });

  it('should emit a LOAD_SUCCESS after events are fetch successfully', function(done) {
    const expectedActions = [
      { type: events.LOAD },
      { type: events.LOAD_SUCCESS, events: mockEvents  }
    ];
    const store = mockStore({ events: [] });
    store.dispatch(events.loadEvents())
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      }).then(done).catch(done);

  });

  it('should emit a LOAD_SUCCESS after a new event was created', (done) => {
    const expectedActions = [
      { type: events.LOAD },
      { type: events.LOAD_SUCCESS, events: mockEvents  }
    ];
    const store = mockStore({ events: [] });
    store.dispatch(events.submitNewEvent(mockEvents[0]))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      }).then(done).catch(done);
  });
});

// test that the reducers return the correct state after applying the action
describe('events reducer', () => {
  const initialState = {
      loading: false,
      loaded: false,
      events: [],
      addingNewEvent: false
  };

  //ensure reducer does not mutate initialState
  deepFreeze(initialState);

  it('should return the initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual(initialState);
  });

  it('should handle LOAD', () => {
    expect(
      reducer(initialState, {
        type: events.LOAD
      })
    ).toEqual({
        loading: true,
        loaded: false,
        events: [],
        addingNewEvent: false
      });
  });

  it('should handle LOAD_SUCCESS', () => {
    expect(
      reducer(initialState, {
        type: events.LOAD_SUCCESS,
        events: mockEvents
      })
    ).toEqual({
        loading: false,
        loaded: true,
        events: mockEvents,
        addingNewEvent: false
      });
  })

});
