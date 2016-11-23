'use strict';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as dataStoresActions from '../ducks/dataStores';
import DataStoresList from '../components/DataStoresList';
import DataStoreForm from '../components/DataStoreForm';
import DataStoresDetailsContainer from './DataStoresDetailsContainer';

let emptyStore = {
  id: false,
  name: '',
  version: '1',
  uri: '',
  store_type: ''
};

export class DataStoresContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      addingNewDataStore: false
    };
  }

  loadDataStores() {
    this.props.actions.loadDataStores();
  }

  componentDidMount() {
    this.loadDataStores();
  }

  addNewDataStore() {
    this.setState({ addingNewDataStore: true });
  }

  addNewDataStoreCancel() {
    this.setState({ addingNewDataStore: false });
  }

  submitNewDataStore(storeId, data) {
    this.setState({ addingNewDataStore: false });
    this.props.actions.submitNewDataStore(data);
  }

  render() {
    const { loading, stores, addingNewDataStore, newDataStoreId, storeErrors, layerList, children, selectedTeamId } = this.props;
    if (children) {
      return (
        <div className="wrapper">
          <section className="main">
            {children}
          </section>
        </div>
      );
    }
    return (
      <div className="wrapper">
        <section className="main">
          {loading ? <p>Fetching Data Stores...</p> :
            this.state.addingNewDataStore ?
            <DataStoreForm
              ref="newDataStoreForm"
              onSubmit={this.submitNewDataStore.bind(this)}
              cancel={this.addNewDataStoreCancel.bind(this)}
              actions={this.props.actions}
              errors={storeErrors}
              layerList={layerList}
              store={emptyStore}
              /> :
            <div className="btn-toolbar">
              <button className="btn btn-sc" onClick={this.addNewDataStore.bind(this)}>Create Store</button>
            </div>
          }
          <DataStoresList dataStores={stores} selectedTeamId={selectedTeamId} />
        </section>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  loading: state.sc.dataStores.loading,
  stores: state.sc.dataStores.stores,
  storeErrors: state.sc.dataStores.storeErrors,
  layerList: state.sc.dataStores.layerList,
  selectedTeamId: state.sc.auth.selectedTeamId,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(dataStoresActions, dispatch)
});

  // connect this "smart" container component to the redux store
export default connect(mapStateToProps, mapDispatchToProps)(DataStoresContainer);
