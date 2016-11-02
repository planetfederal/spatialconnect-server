'use strict';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as formActions from '../ducks/forms';
import FormsList from '../components/FormsList';
import FormCreate from '../components/FormCreate';
import FormDetailsContainer from './FormDetailsContainer';
import { Link, browserHistory } from 'react-router';

class FormsContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      addingNewForm: false
    };
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

  componentDidMount() {
    this.props.actions.loadForms();
  }

  render() {
    const { children } = this.props;
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
          {this.state.addingNewForm || this.props.addFormError ?
            <FormCreate
              ref="newForm"
              onSubmit={this.submitNewForm.bind(this)}
              cancel={this.addNewFormCancel.bind(this)}
              forms={this.props.forms}
              addFormError={this.props.addFormError}
              /> :
            <div className="btn-toolbar">
              <button className="btn btn-sc" onClick={this.addNewForm.bind(this)}>Create Form</button>
            </div>
          }
          <FormsList forms={this.props.forms} />
        </section>
        {this.props.children}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  loading: state.sc.forms.get('loading'),
  forms: state.sc.forms.get('forms'),
  addFormError: state.sc.forms.get('addFormError')
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(formActions, dispatch)
});

  // connect this "smart" container component to the redux store
export default connect(mapStateToProps, mapDispatchToProps)(FormsContainer);
