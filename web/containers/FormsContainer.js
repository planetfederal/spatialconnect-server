'use strict';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as formActions from '../ducks/forms';
import FormsList from '../components/FormsList';
import { Link, browserHistory } from 'react-router';

class FormsContainer extends Component {

  componentDidMount() {
    this.props.actions.loadForms();
  }

  render() {
    return (
      <div className="wrapper">
        <section className="main">
          {this.props.loading ? 'Fetching Forms...' :
            <div>
              <div className="btn-toolbar">
                <button className="btn btn-sc" onClick={this.props.actions.addForm}>Create Form</button>
              </div>
              <FormsList forms={this.props.forms} />
            </div>}
        </section>
        {this.props.children}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  loading: state.sc.forms.get('loading'),
  forms: state.sc.forms.get('forms')
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(formActions, dispatch)
});

  // connect this "smart" container component to the redux store
export default connect(mapStateToProps, mapDispatchToProps)(FormsContainer);
