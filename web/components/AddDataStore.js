'use strict';
import React, { PropTypes } from 'react';

const AddDataStore = ({ onClick }) => (
  <button onClick={onClick}>Add Data Store</button>
);

AddDataStore.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default AddDataStore;
