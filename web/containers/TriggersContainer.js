import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as triggerActions from '../ducks/triggers';
import * as storeActions from '../ducks/dataStores';
import TriggerForm from '../components/TriggerForm';
import TriggerList from '../components/TriggerList';

const emptyTrigger = {
  name: '',
  description: '',
  repeated: false,
  recipients: [],
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
    this.props.storeActions.loadDataStores();
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
    const { children } = this.props;
    if (children) {
      return (
        <div className="wrapper">
          {children}
        </div>
      );
    }
    console.log(this.props.stores);
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
            stores={this.props.stores}
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
  stores: state.sc.dataStores.stores,
  errors: state.sc.triggers.errors
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(triggerActions, dispatch),
  storeActions: bindActionCreators(storeActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(TriggersContainer);