import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import isEqual from 'lodash/isEqual';
import last from 'lodash/last';
import uniqueId from 'lodash/uniqueId';
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

ErrorMessage.propTypes = {
  error: PropTypes.object.isRequired,
};

class FormDetailsContainer extends Component {

  static checkEditStatus(props) {
    let edited = false;
    if (props.savedForm && props.form) {
      if (!(props.savedForm.form_label === props.form.form_label)) {
        edited = true;
      }
      if (!isEqual(props.savedForm.fields, props.form.fields)) {
        edited = true;
      }
    }
    return edited;
  }

  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false,
      validationErrors: false,
      edited: false,
    };

    this.saveForm = this.saveForm.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  componentWillMount() {
    if (!this.props.form) {
      this.props.actions.loadForm(this.props.form_key);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ edited: FormDetailsContainer.checkEditStatus(nextProps) });
  }

  saveForm() {
    const form = this.props.form;
    const validationErrors = scformschema.validate(form);
    if (validationErrors.length) {
      this.setState({
        modalIsOpen: true,
        validationErrors,
      });
    } else {
      this.setState({ validationErrors: false });
      this.props.actions.saveForm(form);
    }
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  render() {
    const { form, activeForm, activeField, savedForm } = this.props;
    if (!form) {
      return <div className="form-details">Fetching Form...</div>;
    }
    return (
      <div className="form-details">
        <Modal
          isOpen={this.state.modalIsOpen}
          className="sc-modal"
          overlayClassName="sc-overlay"
        >
          <h3>Errors</h3>
          {this.state.validationErrors ? this.state.validationErrors.map(e =>
            <ErrorMessage key={uniqueId()} error={e} />) : <div />
          }
          <button className="btn btn-sc" onClick={this.closeModal}>Dismiss</button>
        </Modal>
        <FormInfoBar
          form={form}
          saved_form={savedForm}
          updateActiveForm={this.props.actions.updateActiveForm}
          saveForm={this.saveForm}
          edited={this.state.edited}
        />
        <div className="form-builder">
          <FormControls
            form={form}
            addField={options => this.props.actions.addField(options)}
            updateForm={newForm => this.props.actions.updateForm(newForm)}
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
              activeField={activeField}
              updateFieldOption={this.props.actions.updateFieldOption}
              updateFieldConstraint={this.props.actions.updateFieldConstraint}
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

FormDetailsContainer.propTypes = {
  actions: PropTypes.object.isRequired,
  form_key: PropTypes.string.isRequired,
  form: PropTypes.object.isRequired,
  savedForm: PropTypes.object,
  activeForm: PropTypes.string,
  activeField: PropTypes.string,
};

const mapStateToProps = (state, ownProps) => ({
  form_key: ownProps.params.form_key,
  loading: state.sc.forms.loading,
  forms: state.sc.forms.forms,
  form: state.sc.forms.forms[ownProps.params.form_key],
  saved_forms: state.sc.forms.saved_forms,
  savedForm: state.sc.forms.saved_forms[ownProps.params.form_key],
  activeForm: state.sc.forms.activeForm,
  activeField: state.sc.forms.activeField,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(formActions, dispatch),
});

  // connect this "smart" container component to the redux store
export default connect(mapStateToProps, mapDispatchToProps)(FormDetailsContainer);
