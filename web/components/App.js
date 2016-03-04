'use strict';
import React from 'react';
import { Link } from 'react-router';

// create a stateless functional react component for our App
// https://facebook.github.io/react/blog/2015/10/07/react-v0.14.html#stateless-functional-components
// also using implicit return syntax
// https://egghead.io/lessons/react-building-stateless-function-components-new-in-react-0-14
const App = (props) => (
  <div>
    <h1>SpatialConnect Dashboard!</h1>
    <nav>
      <ul>
        <li>
          <Link to="/events">Events</Link>
        </li>
      </ul>
    </nav>
    {props.children}
  </div>
);

export default App;
