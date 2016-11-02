import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const SideMenu = ({ isAuthenticated, actions, userName }) => (
  <div className="side-menu">
    {isAuthenticated ?
      <nav>
        <div className="side-menu-item">
          <Link to="/stores" activeClassName="active">Stores</Link>
        </div>
        <div className="side-menu-item">
          <Link to="/forms" activeClassName="active">Forms</Link>
        </div>
        <div className="side-menu-item">
          <Link to="/triggers" activeClassName="active">Triggers</Link>
        </div>
        <div className="side-menu-item">
          <Link to="/data" activeClassName="active">Data</Link>
        </div>
        <div className="side-menu-separator"></div>
        <div className="side-menu-item">
          <Link to={`/user`} activeClassName="active">{userName}</Link>
        </div>
        <div className="side-menu-item">
          <a href='#' onClick={() => actions.logoutAndRedirect()} aria-hidden="true">Sign Out</a>
        </div>
        <div className="side-menu-spacer"></div>
        <div className="side-menu-item bottom">
          <span>{'v'+VERSION}</span>
        </div>
      </nav>
      : <nav>
            <div className="side-menu-item">
              <Link to="/login" activeClassName="active">Sign In</Link>
            </div>
            <div className="side-menu-item">
              <Link to="/signup" activeClassName="active">Sign Up</Link>
            </div>
        </nav>
    }

  </div>
);

SideMenu.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
  userName: PropTypes.string
};

export default SideMenu;