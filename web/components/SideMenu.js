import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const SideMenuItem = ({ path, name, onClick }) => (
  <div className="side-menu-item">
    <Link to={path} activeClassName="active" onClick={onClick}>{name}</Link>
  </div>
);

const SideMenu = ({ isAuthenticated, actions, userName, closeMenu, menuOpen, changeTeam, teams}) => (
  <div className={'side-menu ' + (menuOpen ? 'open' : 'closed')}>
    {isAuthenticated ?
      <nav>
        <SideMenuItem path={'/stores'} name={'Stores'} onClick={closeMenu} />
        <SideMenuItem path={'/forms'} name={'Forms'} onClick={closeMenu} />
        <SideMenuItem path={'/triggers'} name={'Triggers'} onClick={closeMenu} />
        <SideMenuItem path={'/data'} name={'Data'} onClick={closeMenu} />
        <div className="side-menu-separator"></div>
        <select className="form-control" onChange={changeTeam}>
        {teams.map((team,i) => (
          <option value={team.id} key={team.id}>{team.name}</option>
        ))}
        </select>
        <SideMenuItem path={'/user'} name={userName} onClick={closeMenu} />
        <SideMenuItem path={'/login'} name={'Sign Out'} onClick={() => {
          actions.logoutAndRedirect();
          closeMenu();
        }} />
        <div className="side-menu-separator"></div>
        <div className="side-menu-spacer"></div>
        <div className="side-menu-item bottom">
          <span>{'v'+VERSION}</span>
        </div>
      </nav>
      : <nav>
          <SideMenuItem path={'/login'} name={'Sign In'} onClick={closeMenu} />
          <SideMenuItem path={'/signup'} name={'Sign Up'} onClick={closeMenu} />
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
