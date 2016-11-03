'use strict';
import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as dataActions from '../ducks/data';
import * as storeActions from '../ducks/dataStores';
import * as formActions from '../ducks/forms';
import * as triggerActions from '../ducks/triggers';
import Home from '../components/Home';

class HomeContainer extends Component {
  componentDidMount() {
    this.props.dataActions.loadDeviceLocations();
    this.props.triggerActions.loadTriggers();
    this.props.formActions.loadForms();
    this.props.storeActions.loadDataStores();
  }
  render() {
    return (
      <Home {...this.props} />
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    forms: state.sc.forms.get('forms').toJS(),
    stores: state.sc.dataStores.stores,
    device_locations: state.sc.data.device_locations,
    spatial_triggers: state.sc.triggers.spatial_triggers
  };
};

const mapDispatchToProps = (dispatch) => ({
  dataActions: bindActionCreators(dataActions, dispatch),
  formActions: bindActionCreators(formActions, dispatch),
  triggerActions: bindActionCreators(triggerActions, dispatch),
  storeActions: bindActionCreators(storeActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeContainer);
