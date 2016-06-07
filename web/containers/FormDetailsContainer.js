'use strict';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import scformschema from 'spatialconnect-form-schema';
import * as formActions from '../ducks/forms';
import FormInfoBar from '../components/FormInfoBar';
import FormControls from '../components/FormControls';
import FormPreview from '../components/FormPreview';
import FormOptions from '../components/FormOptions';
import FieldOptions from '../components/FieldOptions';

class FormDetailsContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false,
      validationErrors: false
    };
  }

  componentDidMount() {
    this.props.actions.loadForm(this.props.id);
  }

  saveForm(formId) {
    let validationErrors = scformschema.validate(this.props.form.toJS());
    if (validationErrors.length) {
      this.setState({
        modalIsOpen: true,
        validationErrors: validationErrors
      });
    } else {
      this.setState({ validationErrors: false });
      this.props.actions.saveForm(formId);
    }
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  render() {
    const {loading, forms, form, activeForm} = this.props;
    if (!forms.count()) {
      return <div className="wrapper">Fetching Form...</div>
    } else {
      return (
        <div className="wrapper">
          <div className="form-details">
          <Modal
            isOpen={this.state.modalIsOpen}
            className="sc-modal"
            overlayClassName="sc-overlay"
            >
            <h3>Errors</h3>
            {this.state.validationErrors ? this.state.validationErrors.map((e, i) => {
              return <p key={i}>{e.name} {e.message}</p>;
            }) : <div></div>}
            <button className="btn btn-sc" onClick={this.closeModal.bind(this)}>Dismiss</button>
          </Modal>
            <FormInfoBar
              form={form}
              updateActiveForm={this.props.actions.updateActiveForm}
              saveForm={this.saveForm.bind(this)}
              />
            <div className="form-builder">
              <FormControls
                form={form}
                addField={(options) => this.props.actions.addField(options)}
                updateForm={(newForm) => this.props.actions.updateForm(newForm)}
                />
              <FormPreview
                form={form}
                updateActiveField={this.props.actions.updateActiveField}
                updateFormValue={this.props.actions.updateFormValue}
                swapFieldOrder={this.props.actions.swapFieldOrder}
                />
              {activeForm !== false ?
                <FormOptions
                  form={form}
                  updateFormName={this.props.actions.updateFormName}
                  deleteForm={this.props.actions.deleteForm}
                  /> :
                <FieldOptions
                  form={form}
                  updateFieldOption={this.props.actions.updateFieldOption}
                  removeField={this.props.actions.removeField}
                  changeFieldName={this.props.actions.changeFieldName}
                  changeRequired={this.props.actions.changeRequired}
                  />
              }
            </div>
          </div>
        </div>
      );
    }
  }
}

function mapAtomStateToProps(state, ownProps) {
  return {
    id: ownProps.params.id,
    loading: state.sc.forms.get('loading'),
    form: state.sc.forms.getIn(['forms', ownProps.params.id.toString()]),
    forms: state.sc.forms.get('forms'),
    activeForm: state.sc.forms.get('activeForm')
  };
}

function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(formActions, dispatch) };
}

  // connect this "smart" container component to the redux store
export default connect(mapAtomStateToProps, mapDispatchToProps)(FormDetailsContainer);
