'use strict';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as dataStoresActions from '../ducks/dataStores';
import DataStoresList from '../components/DataStoresList';
import AddDataStore from '../components/AddDataStore';
import DataStoreForm from '../components/DataStoreForm';
import { getValues } from 'redux-form';

export class DataStoresContainer extends Component {

  loadDataStores = () => {
    this.props.actions.loadDataStores();
  }

  componentDidMount() {
    this.loadDataStores();
  }

  addNewDataStore = () => {
    this.props.actions.addNewDataStoreClicked();
  }

  submitNewDataStore = (data) => {
    this.props.actions.submitNewDataStore(data);
  }

  saveDataStores = () => {
    // if you are currently adding a new store, the save button will only
    // save changes to the new data store
    if (this.props.addingNewDataStore) {
      // trigger submit
      this.refs.newDataStoreForm.submit();
    }
    else {
      // for now, just sync the current state b/c put operations are idempotent
      const storeIds = Object.keys(this.props.forms);
      let formValues = storeIds.map((storeId) => {
        return getValues(this.props.forms[storeId]);
      });
      this.props.actions.updateDataStores(formValues);
    }
  }

  render() {
    const {loading, stores, addingNewDataStore, newDataStoreId} = this.props;
    let initialValues = {storeId: newDataStoreId};

    return (
      <div className="wrapper">
        <section className="main">
          <p>{loading ? 'Fetching Data Stores...': ''}</p>
          {addingNewDataStore
            ? <DataStoreForm
                ref="newDataStoreForm"
                initialValues={initialValues}
                onSubmit={this.submitNewDataStore}
                />
            : <AddDataStore onClick={this.addNewDataStore} />}
          <DataStoresList
            dataStores={stores}
            onSubmit={this.saveDataStores}
            />
          <button onClick={this.saveDataStores}>Save</button>
        </section>
      </div>
    );
  }
}

function mapAtomStateToProps(state) {
  return {
    loading: state.sc.dataStores.loading,
    stores: state.sc.dataStores.stores,
    addingNewDataStore: state.sc.dataStores.addingNewDataStore,
    newDataStoreId: state.sc.dataStores.newDataStoreId,
    forms: state.form.dataStore
  };
}

function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(dataStoresActions, dispatch) };
}

  // connect this "smart" container component to the redux store
export default connect(mapAtomStateToProps, mapDispatchToProps)(DataStoresContainer);
