import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as dataActions from '../ducks/data';
import * as storeActions from '../ducks/dataStores';
import * as formActions from '../ducks/forms';
import * as teamActions from '../ducks/teams';
import Home from '../components/Home';

class HomeContainer extends Component {
  componentDidMount() {
    this.props.dataActions.loadDeviceLocations();
    this.props.formActions.loadForms();
    this.props.storeActions.loadDataStores();
    this.props.teamActions.loadTeams();
  }
  render() {
    return <Home {...this.props} />;
  }
}

HomeContainer.propTypes = {
  dataActions: PropTypes.object.isRequired,
  formActions: PropTypes.object.isRequired,
  storeActions: PropTypes.object.isRequired,
  teamActions: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  forms: state.sc.forms.forms,
  stores: state.sc.dataStores.stores,
  device_locations: state.sc.data.device_locations,
  teams: state.sc.teams.teams,
  userTeams: state.sc.auth.user.teams,
});

const mapDispatchToProps = dispatch => ({
  dataActions: bindActionCreators(dataActions, dispatch),
  formActions: bindActionCreators(formActions, dispatch),
  storeActions: bindActionCreators(storeActions, dispatch),
  teamActions: bindActionCreators(teamActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeContainer);
