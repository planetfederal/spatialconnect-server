import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as dataActions from '../ducks/data';
import * as formActions from '../ducks/forms';
import FormList from '../components/DataMapFormList';
import DataMap from '../components/DataMap';

export class DataContainer extends Component {

  componentDidMount() {
    this.props.dataActions.loadDeviceLocations();
    this.props.formActions.loadForms()
      .then(() => {
        this.props.dataActions.loadFormDataAll();
      })
  }

  render () {
    return (
      <div className="data-map">
        <FormList {...this.props} />
        <DataMap {...this.props} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  form_data: state.sc.data.form_data,
  form_ids: state.sc.data.form_ids,
  forms: state.sc.forms.get('forms').toJS(),
  device_locations: state.sc.data.device_locations,
  device_locations_on: state.sc.data.device_locations_on,
});

const mapDispatchToProps = (dispatch) => ({
  dataActions: bindActionCreators(dataActions, dispatch),
  formActions: bindActionCreators(formActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(DataContainer);