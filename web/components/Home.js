'use strict';
import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const Home = () => (
  <div className="wrapper">
    <section className="main">
      <ul>
        <li><Link to="/stores">Stores</Link></li>
        <li><Link to="/forms">Forms</Link></li>
        <li><Link to="/triggers">Triggers</Link></li>
        <li><Link to="/data">Data</Link></li>
      </ul>
    </section>
  </div>
);

export default Home;
