import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as formActions from '../ducks/forms';
import FormsList from '../components/FormsList';
import { FormCreate } from '../components/FormCreate';

class FormsContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      addingNewForm: false,
    };

    this.addNewForm = this.addNewForm.bind(this);
    this.addNewFormCancel = this.addNewFormCancel.bind(this);
    this.submitNewForm = this.submitNewForm.bind(this);
  }

  componentDidMount() {
    this.props.actions.loadForms();
  }

  addNewForm() {
    this.setState({ addingNewForm: true });
  }

  addNewFormCancel() {
    this.setState({ addingNewForm: false });
    this.props.actions.addFormError(false);
  }

  submitNewForm(form) {
    this.setState({ addingNewForm: false });
    this.props.actions.addForm(form);
  }

  render() {
    const { forms, selectedTeamId, addFormError, children } = this.props;
    if (children) {
      return (
        <div className="wrapper">
          <section className="main noPad">
            {children}
          </section>
        </div>
      );
    }
    return (
      <div className="wrapper">
        <section className="main">
          {this.state.addingNewForm || addFormError ?
            <FormCreate
              onSubmit={this.submitNewForm}
              cancel={this.addNewFormCancel}
              forms={forms}
              addFormError={addFormError}
            /> :
            <div className="btn-toolbar">
              <button className="btn btn-sc" onClick={this.addNewForm}>Create Form</button>
            </div>
          }
          <FormsList forms={forms} selectedTeamId={selectedTeamId} />
        </section>
        {children}
      </div>
    );
  }
}

FormsContainer.propTypes = {
  actions: PropTypes.object.isRequired,
  forms: PropTypes.object.isRequired,
  selectedTeamId: PropTypes.number,
  addFormError: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  children: PropTypes.object,
};

const mapStateToProps = state => ({
  loading: state.sc.forms.loading,
  forms: state.sc.forms.forms,
  addFormError: state.sc.forms.addFormError,
  selectedTeamId: state.sc.auth.selectedTeamId,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(formActions, dispatch),
});

  // connect this "smart" container component to the redux store
export default connect(mapStateToProps, mapDispatchToProps)(FormsContainer);
