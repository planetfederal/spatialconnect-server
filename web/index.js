'use strict';
import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import appReducer from './ducks';
import AppContainer from './containers/AppContainer';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer, routerMiddleware } from 'react-router-redux';
import { requireAuthentication } from './utils';
import { loginUserSuccess } from './ducks/auth';
import Home from './components/Home';
import SignUpContainer from './containers/SignUpContainer';
import LoginContainer from './containers/LoginContainer';
import DataStoresContainer from './containers/DataStoresContainer';
import FormsContainer from './containers/FormsContainer';
import FormDetailsContainer from './containers/FormDetailsContainer';
import DataStoresDetailsContainer from './containers/DataStoresDetailsContainer';

import './style/Globals.less';

// combine all the reducers into a single reducing function
const rootReducer = combineReducers({
  sc: appReducer,
  routing: routerReducer
});

// create the redux store that holds the state for this app
// http://redux.js.org/docs/api/createStore.html
const middleware = routerMiddleware(browserHistory);
let store = createStore(
  rootReducer,
  applyMiddleware(middleware, thunk, createLogger()) // logger must be the last in the chain
);

let token = localStorage.getItem('token');
if (token !== null) {
  store.dispatch(loginUserSuccess(token));
}


// create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store);

// wrap the App component with the react-redux Provider component to make the
// store available to all container components without passing it down
// explicitly as a prop
render(
  <Provider store={store}>
    { /* Tell the Router to use our enhanced history */ }
    <Router history={history}>
      <Route path="/" component={AppContainer}>
        <IndexRoute component={Home} />
        <Route path="/login" component={LoginContainer}/>
        <Route path="/signup" component={SignUpContainer}/>
        <Route path="/stores" component={requireAuthentication(DataStoresContainer)}>
        </Route>
        <Route path="/stores/:id" component={requireAuthentication(DataStoresDetailsContainer)} >
        </Route>
        <Route path="/stores/edit/:id" component={requireAuthentication(DataStoresDetailsContainer)} >
        </Route>
        <Route path="/forms" component={requireAuthentication(FormsContainer)}>
        </Route>
        <Route path="/forms/:form_key" component={requireAuthentication(FormDetailsContainer)} >
        </Route>
      </Route>
    </Router>
  </Provider>,
  document.getElementById("root")
);
