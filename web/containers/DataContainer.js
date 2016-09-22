import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as dataActions from '../ducks/data';
import * as formActions from '../ducks/forms';
import FormList from '../components/DataMapFormList';
import DataMap from '../components/DataMap';

export class DataContainer extends Component {

  componentDidMount() {
    this.props.formActions.loadForms()
      .then(() => {
        this.props.dataActions.loadFormDataAll();
      })
  }

  render () {
    return (
      <div className="data-map">
        <FormList forms={this.props.forms} form_data={this.props.form_data} form_ids={this.props.form_ids} actions={this.props.dataActions} />
        <DataMap forms={this.props.forms.toJS()} form_data={this.props.form_data} form_ids={this.props.form_ids} actions={this.props.dataActions} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  form_data: state.sc.data.form_data,
  form_ids: state.sc.data.form_ids,
  forms: state.sc.forms.get('forms'),
});

const mapDispatchToProps = (dispatch) => ({
  dataActions: bindActionCreators(dataActions, dispatch),
  formActions: bindActionCreators(formActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(DataContainer);