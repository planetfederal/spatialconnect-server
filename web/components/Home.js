import React, { PropTypes } from 'react';
import { reduce } from 'lodash';
import PropertyListItem from './PropertyListItem';

const Home = ({ stores, forms, spatial_triggers, device_locations }) => (
  <div className="wrapper">
    <section className="main">
      <p>Welcome to the spatialconnect dashboard.</p>
      <div className="form-list">
        <div className="form-item">
          <div className="properties">
            <PropertyListItem name={'Stores'} value={Object.keys(stores).length} />
            <PropertyListItem name={'Forms'} value={Object.keys(forms).length} />
            <PropertyListItem
              name={'Form Submissions'}
              value={reduce(forms, (r, v) => r + v.metadata.count, 0)}
            />
            <PropertyListItem
              name={'Spatial Triggers'} value={Object.keys(spatial_triggers).length}
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
  spatial_triggers: PropTypes.object.isRequired,
  device_locations: PropTypes.array.isRequired,
};

export default Home;
