'use strict';
import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import appReducer from './ducks';
import App from './components/App';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import { reducer as formReducer } from 'redux-form';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';
import EventsContainer from './containers/EventsContainer';
import EventDetails from './components/EventDetails';

// combine all the reducers into a single reducing function
const rootReducer = combineReducers({
  sc: appReducer,
  form: formReducer,
  routing: routerReducer
});

// create the redux store that holds the state for this app
// http://redux.js.org/docs/api/createStore.html
let store = createStore(
  rootReducer,
  applyMiddleware(thunk, createLogger()) // logger must be the last in the chain
);

// create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store);

// wrap the App component with the react-redux Provider component to make the
// store available to all container components without passing it down
// explicitly as a prop
render(
  <Provider store={store}>
    { /* Tell the Router to use our enhanced history */ }
    <Router history={history}>
      <Route path="/" component={App}>
        <Route path="/events" component={EventsContainer}>
          <Route path="/events/:id" component={EventDetails} />
        </Route>
      </Route>
    </Router>
  </Provider>,
  document.getElementById("app")
);
