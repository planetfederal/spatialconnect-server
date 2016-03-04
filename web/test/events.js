'use strict';
import expect from 'expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import * as events from '../ducks/events';
import reducer from '../ducks/events'

// test the action creators that return an object
describe('events action creators', () => {
  it('should create an action that receives events', () => {
    const eventsResponse = [{
      'name': 'some name',
      'description': 'some description'
    }];
    const expectedAction = {
      type: events.LOAD_SUCCESS,
      events: eventsResponse
    };
    expect(events.receiveEvents(eventsResponse)).toEqual(expectedAction);
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
  afterEach(() => {
    nock.cleanAll();
  });

  it('should emit a LOAD_SUCCESS after events are fetch successfully', (done) => {
    const eventsResponse = [{
      'name': 'some name',
      'description': 'some description'
    }];
    nock('http://localhost:3000/api/')
      .get('/events')
      .reply(200, eventsResponse);
    const expectedActions = [
      { type: events.LOAD },
      { type: events.LOAD_SUCCESS, events: eventsResponse  }
    ];
    const store = mockStore({ events: [] }, expectedActions, done);
    store.dispatch(events.loadEvents());
  });

  it('should emit a LOAD_SUCCESS after a new event was created', (done) => {
    const mockEvent = {
      'name': 'some name',
      'description': 'some description'
    };
    const eventsResponse = [ mockEvent ];
    nock('http://localhost:3000/api/')
      .get('/events')
      .reply(200, eventsResponse);
    nock('http://localhost:3000/api/')
      .post('/events')
      .reply(200);
    const expectedActions = [
      { type: events.LOAD },
      { type: events.LOAD_SUCCESS, events: eventsResponse  }
    ];
    const store = mockStore({ events: [] }, expectedActions, done);
    store.dispatch(events.loadEvents());
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
    const eventsResponse = [{
      'name': 'some name',
      'description': 'some description'
    }];
    expect(
      reducer(initialState, {
        type: events.LOAD_SUCCESS,
        events: eventsResponse
      })
    ).toEqual({
        loading: false,
        loaded: true,
        events: eventsResponse,
        addingNewEvent: false
      });
  })
});
