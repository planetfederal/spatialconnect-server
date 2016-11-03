import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as dataActions from '../ducks/data';
import * as formActions from '../ducks/forms';
import * as triggerActions from '../ducks/triggers';
import FormList from '../components/DataMapFormList';
import DataMap from '../components/DataMap';

export class DataContainer extends Component {

  componentDidMount() {
    this.props.dataActions.loadDeviceLocations();
    this.props.triggerActions.loadTriggers();
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
  spatial_triggers_on: state.sc.data.spatial_triggers_on,
  spatial_triggers: state.sc.triggers.spatial_triggers
});

const mapDispatchToProps = (dispatch) => ({
  dataActions: bindActionCreators(dataActions, dispatch),
  formActions: bindActionCreators(formActions, dispatch),
  triggerActions: bindActionCreators(triggerActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(DataContainer);