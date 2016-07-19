import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const Header = ({ isAuthenticated, logout, userName }) => (
  <header>
    <Link to="/">EFC Dashboard</Link>
    {isAuthenticated ?
      <nav>
        <Link to="/stores" activeClassName="active">Stores</Link>
        <Link to="/forms" activeClassName="active">Forms</Link>
        <div className="user">{ userName }
          <a href='#' onClick={() => logout()} className="glyphicon glyphicon-log-out" aria-hidden="true"></a>
        </div>
      </nav>
      : <nav>
          <div className="user">{ userName }
            <Link to="/login" activeClassName="active">Login</Link>
            <Link to="/signup" activeClassName="active">Sign Up</Link>
          </div>
        </nav>
    }
  </header>
);

Header.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
  userName: PropTypes.string
};

export default Header;