'use strict';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import { last } from 'lodash';
import scformschema from 'spatialconnect-form-schema';
import * as formActions from '../ducks/forms';
import FormInfoBar from '../components/FormInfoBar';
import FormControls from '../components/FormControls';
import FormPreview from '../components/FormPreview';
import FormOptions from '../components/FormOptions';
import FieldOptions from '../components/FieldOptions';

const ErrorMessage = ({ error }) => (
  <p>
    {error.property.split('.').length ?
    last(error.property.split('.')) : error.property} {error.message}
  </p>
);

class FormDetailsContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false,
      validationErrors: false,
      edited: false
    };
  }

  componentWillMount() {
    if (!this.props.form) {
      this.props.actions.loadForm(this.props.form_key);
    }
  }

  checkEditStatus(props) {
    let edited = false;
    if (props.saved_form && props.form) {
      if ((props.saved_form.get('form_label') === props.form.get('form_label')) === false) {
        edited = true;
      }
      if (props.saved_form.get('fields').equals(props.form.get('fields')) === false) {
        edited = true;
      }
    }
    return edited;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ edited: this.checkEditStatus(nextProps) });
  }

  saveForm(formId) {
    let form = this.props.form.toJS();
    let validationErrors = scformschema.validate(form);
    if (validationErrors.length) {
      this.setState({
        modalIsOpen: true,
        validationErrors: validationErrors
      });
    } else {
      this.setState({ validationErrors: false });
      this.props.actions.saveForm(form);
    }
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  render() {
    const {loading, forms, form, activeForm, saved_form, saved_forms} = this.props;
    if (!form) {
      return <div className="form-details">Fetching Form...</div>
    } else {
      return (
        <div className="form-details">
          <Modal
            isOpen={this.state.modalIsOpen}
            className="sc-modal"
            overlayClassName="sc-overlay"
            >
            <h3>Errors</h3>
            {this.state.validationErrors ? this.state.validationErrors.map((e, i) => {
              return <ErrorMessage key={i} error={e} />;
            }) : <div></div>}
            <button className="btn btn-sc" onClick={this.closeModal.bind(this)}>Dismiss</button>
          </Modal>
          <FormInfoBar
            form={form}
            saved_form={saved_form}
            updateActiveForm={this.props.actions.updateActiveForm}
            saveForm={this.saveForm.bind(this)}
            edited={this.state.edited}
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
      );
    }
  }
}

const mapStateToProps = (state, ownProps) => ({
  form_key: ownProps.params.form_key,
  loading: state.sc.forms.get('loading'),
  forms: state.sc.forms.get('forms'),
  form: state.sc.forms.get('forms').findLast(f => f.get('form_key') === ownProps.params.form_key),
  saved_forms: state.sc.forms.get('saved_forms'),
  saved_form: state.sc.forms.get('saved_forms').findLast(f => f.get('form_key') === ownProps.params.form_key),
  activeForm: state.sc.forms.get('activeForm')
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(formActions, dispatch)
});

  // connect this "smart" container component to the redux store
export default connect(mapStateToProps, mapDispatchToProps)(FormDetailsContainer);
