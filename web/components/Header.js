import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import Breadcrumbs from './Breadcrumbs';

class Header extends Component {
  render() {
    //console.log('Header props', this.props);
    const { isAuthenticated, logout, userName, routes } = this.props;
    const depth = routes.length;
    return (
      <header>
        <div className="header-title">
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