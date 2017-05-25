import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const SideMenuItem = ({ path, name, onClick }) => (
  <div className="side-menu-item">
    <Link to={path} activeClassName="active" onClick={onClick}>{name}</Link>
  </div>
);

SideMenuItem.propTypes = {
  path: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

const SideMenu = ({
  isAuthenticated,
  actions,
  userName,
  closeMenu,
  menuOpen,
  changeTeam,
  teams,
}) => (
  <div className={`side-menu ${menuOpen ? 'open' : 'closed'}`}>
    {isAuthenticated
      ? <nav>
          <SideMenuItem path={'/stores'} name={'Stores'} onClick={closeMenu} />
          <SideMenuItem path={'/forms'} name={'Forms'} onClick={closeMenu} />
          <SideMenuItem path={'/data'} name={'Data'} onClick={closeMenu} />
          <div className="side-menu-separator" />
          <div className="side-menu-item">
            <SideMenuItem path={'/teams'} name={'Teams'} onClick={closeMenu} />
            <div className="side-menu-item-inner">
              {!!teams.length &&
                <select className="form-control sc-dropdown" onChange={changeTeam}>
                  {teams.map(team => <option value={team.id} key={team.id}>{team.name}</option>)}
                </select>}
            </div>
          </div>
          <SideMenuItem path={'/user'} name={userName} onClick={closeMenu} />
          <SideMenuItem
            path={'/login'}
            name={'Sign Out'}
            onClick={() => {
              actions.logoutAndRedirect();
              closeMenu();
            }}
          />
          <div className="side-menu-separator" />
          <div className="side-menu-spacer" />
          <div className="side-menu-item bottom">
            <span>{`v${VERSION}`}</span>
          </div>
        </nav>
      : <nav>
          <SideMenuItem path={'/login'} name={'Sign In'} onClick={closeMenu} />
          <SideMenuItem path={'/signup'} name={'Sign Up'} onClick={closeMenu} />
        </nav>}
  </div>
);

SideMenu.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  userName: PropTypes.string,
  actions: PropTypes.object.isRequired,
  closeMenu: PropTypes.func.isRequired,
  menuOpen: PropTypes.bool.isRequired,
  changeTeam: PropTypes.func.isRequired,
  teams: PropTypes.array,
};

export default SideMenu;
