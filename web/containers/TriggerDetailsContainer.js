'use strict';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { find } from 'lodash';
import TriggerDetails from '../components/TriggerDetails';
import * as triggerActions from '../ducks/triggers';

class TriggerDetailsContainer extends Component {

  componentDidMount() {
    this.props.actions.loadTrigger(this.props.id);
  }

  render() {
    return (
      <div className="trigger-details-container">
        {this.props.trigger ?
          <TriggerDetails {...this.props} />
          : null}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  id: ownProps.params.id,
  trigger: find(state.sc.triggers.spatial_triggers, { id: +ownProps.params.id }),
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(triggerActions, dispatch)
});

  // connect this "smart" container component to the redux store
export default connect(mapStateToProps, mapDispatchToProps)(TriggerDetailsContainer);
