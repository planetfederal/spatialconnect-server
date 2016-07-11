import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const Header = ({ isAuthenticated, logout }) => (
  <header>
    <Link to="/">EFC Dashboard</Link>
    {isAuthenticated ?
      <nav>
        <Link to="/stores" activeClassName="active">Stores</Link>
        <Link to="/forms" activeClassName="active">Forms</Link>
        <a href='#' onClick={() => logout()}>Logout</a>
      </nav>
      : <nav><Link to="/login" activeClassName="active">Login</Link></nav>
    }
  </header>
);

Header.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired
};

export default Header;