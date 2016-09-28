import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as triggerActions from '../ducks/triggers';
import TriggerForm from '../components/TriggerForm';
import TriggerList from '../components/TriggerList';

const emptyTrigger = {
  id: false,
  name: '',
  type: '',
};

export class TriggersContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      adding: false
    };
  }

  componentDidMount() {
    this.props.actions.loadTriggers();
  }

  add() {
    this.setState({adding: !this.state.adding});
  }

  cancel() {
    this.setState({adding: false});
  }

  create(trigger) {
    this.setState({adding: false});
    this.props.actions.addTrigger(trigger);
  }

  render () {
    return (
      <div className="wrapper">
        <section className="main">
        {this.state.adding ?
          <TriggerForm
            trigger={emptyTrigger}
            cancel={this.cancel.bind(this)}
            create={this.create.bind(this)}
            errors={this.props.errors}
            actions={this.props.actions}
            /> :
          <div className="btn-toolbar">
            <button className="btn btn-sc" onClick={this.add.bind(this)}>Create Trigger</button>
          </div>}
          <TriggerList {...this.props} />
        </section>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  spatial_triggers: state.sc.triggers.spatial_triggers,
  errors: state.sc.triggers.errors
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(triggerActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(TriggersContainer);