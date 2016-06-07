'use strict';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as formActions from '../ducks/forms';
import FormsList from '../components/FormsList';
import { Link, browserHistory } from 'react-router';

class FormsContainer extends Component {

  loadForms = () => {
    this.props.actions.loadForms();
  }

  componentDidMount() {
    this.loadForms();
  }

  addForm = () => {
    this.props.actions.addForm();
  }

  render() {
    const {loading, forms} = this.props;
    return (
      <div className="wrapper">
        <section className="main">
          {loading ? 'Fetching Forms...' :
            <FormsList forms={forms} addForm={this.addForm.bind(this)}/>}
        </section>
        {this.props.children}
      </div>
    );
  }
}

function mapAtomStateToProps(state) {
  return {
    loading: state.sc.forms.get('loading'),
    forms: state.sc.forms.get('forms')
  };
}

function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(formActions, dispatch) };
}

  // connect this "smart" container component to the redux store
export default connect(mapAtomStateToProps, mapDispatchToProps)(FormsContainer);
