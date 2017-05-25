import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import Ionicon from 'react-ionicons';
import Breadcrumbs from './Breadcrumbs';

const Header = props => (
  <header>
    <div className="header-title">
      <span className="menu" onClick={props.toggleMenu}>
        <Ionicon icon="ion-navicon" fontSize="35px" color="white" />
      </span>
      <Link to="/">Expedited Field Capability</Link>
    </div>
    {props.isAuthenticated &&
      <nav>
        <Breadcrumbs {...props} />
      </nav>}
  </header>
);

Header.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  toggleMenu: PropTypes.func.isRequired,
};

export default Header;
