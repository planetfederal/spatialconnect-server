import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import Breadcrumbs from './Breadcrumbs';

class Header extends Component {
  render() {
    const { isAuthenticated, toggleMenu } = this.props;
    return (
      <header>
        <div className="header-title">
          <span className="menu" onClick={toggleMenu}>&#9776;</span>
          <Link to="/">spatialconnect</Link>
        </div>
        {isAuthenticated &&
          <nav>
            <Breadcrumbs {...this.props} />
          </nav>
        }
      </header>
    );
  }
}

Header.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
  userName: PropTypes.string
};

export default Header;