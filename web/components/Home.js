import React, { PropTypes } from 'react';
import reduce from 'lodash/reduce';
import { Link } from 'react-router';
import PropertyListItem from './PropertyListItem';

const Home = ({ teams, stores, forms, device_locations, userTeams }) => (
  <div className="wrapper">
    <section className="main">
      <p>Welcome to the spatialconnect dashboard.</p>
      {userTeams.length === 0 &&
        <div className="alert alert-warning" role="alert">
          <p>You do not belong to any teams.</p>
          <p>Go to <Link to="/teams">Teams</Link> and choose a team to join.</p>
        </div>
      }
      <div className="form-list">
        <div className="form-item">
          <div className="properties">
            <PropertyListItem name={'Teams'} value={teams.length} />
            <PropertyListItem name={'Stores'} value={Object.keys(stores).length} />
            <PropertyListItem name={'Forms'} value={Object.keys(forms).length} />
            <PropertyListItem
              name={'Form Submissions'}
              value={reduce(forms, (r, v) => r + v.metadata.count, 0)}
            />
            <PropertyListItem name={'Connected Devices'} value={device_locations.length} />
          </div>
        </div>
      </div>
    </section>
  </div>
);

Home.propTypes = {
  stores: PropTypes.object.isRequired,
  forms: PropTypes.object.isRequired,
  device_locations: PropTypes.array.isRequired,
  teams: PropTypes.array.isRequired,
  userTeams: PropTypes.array.isRequired,
};

export default Home;
