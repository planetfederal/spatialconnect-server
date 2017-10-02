import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as dataActions from '../ducks/data';
import * as formActions from '../ducks/forms';
import { FormList } from '../components/DataMapFormList';
import DataMap from '../components/DataMap';

class DataContainer extends Component {
  componentDidMount() {
    this.props.dataActions.loadDeviceLocations();
    this.props.formActions.loadForms().then(() => {
      this.props.dataActions.loadFormDataAll();
    });
  }

  render() {
    return (
      <div className="data-map">
        <FormList {...this.props} />
        <DataMap {...this.props} />
      </div>
    );
  }
}

DataContainer.propTypes = {
  dataActions: PropTypes.object.isRequired,
  formActions: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  formData: state.sc.data.formData,
  form_ids: state.sc.data.form_ids,
  forms: state.sc.forms.forms,
  device_locations: state.sc.data.device_locations,
  deviceLocationsOn: state.sc.data.deviceLocationsOn,
  menu: state.sc.menu,
});

const mapDispatchToProps = dispatch => ({
  dataActions: bindActionCreators(dataActions, dispatch),
  formActions: bindActionCreators(formActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(DataContainer);
