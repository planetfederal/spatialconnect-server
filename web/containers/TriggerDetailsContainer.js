import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import find from 'lodash/find';
import TriggerDetails from '../components/TriggerDetails';
import * as triggerActions from '../ducks/triggers';

class TriggerDetailsContainer extends Component {

  componentDidMount() {
    if (!this.props.trigger) {
      this.props.actions.loadTrigger(this.props.id);
    }
  }

  render() {
    return (
      <section className="main noPad">
        {this.props.trigger ? <TriggerDetails {...this.props} /> : null}
      </section>
    );
  }
}

TriggerDetailsContainer.propTypes = {
  actions: PropTypes.object.isRequired,
  trigger: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  id: ownProps.params.id,
  trigger: find(state.sc.triggers.spatial_triggers, { id: ownProps.params.id }),
  menu: state.sc.menu,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(triggerActions, dispatch),
});

  // connect this "smart" container component to the redux store
export default connect(mapStateToProps, mapDispatchToProps)(TriggerDetailsContainer);
