'use strict';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { find } from 'lodash';
import { browserHistory } from 'react-router';
import DataStoreDetails from '../components/DataStoreDetails';
import DataStoreForm from '../components/DataStoreForm';
import scformschema from 'spatialconnect-form-schema';
import * as storeActions from '../ducks/dataStores';

class DataStoresDetailsContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      editingDataStore: false
    };
  }

  componentDidMount() {
    this.props.actions.loadDataStore(this.props.id);
  }

  deleteStore(storeId) {
    this.props.actions.deleteStore(storeId);
  }

  editStore() {
    this.setState({editingDataStore: true});
  }

  editStoreCancel(storeId, value) {
    this.setState({editingDataStore: false});
  }

  updateStore(storeId, value) {
    this.setState({editingDataStore: false});
    this.props.actions.updateDataStore(storeId, value);
  }

  render() {
    const { stores, store, loading, loaded, error } = this.props;
    let el = <div></div>;
    if (loading) {
      el = <p>Fetching Store...</p>;
    } else {
      if (error) {
        el = <p>Store Not Found</p>;
      }
      if (loaded && store) {
        if (this.state.editingDataStore) {
          el = <DataStoreForm
                store={store}
                onSubmit={this.updateStore.bind(this)}
                cancel={this.editStoreCancel.bind(this)}
                />;
        } else {
          el = <DataStoreDetails
                store={store}
                editStore={this.editStore.bind(this)}
                deleteStore={this.deleteStore.bind(this)}
                />;
        }
      }
    }
    return (
      <div className="wrapper">
        <section className="main">
        {el}
        </section>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  id: ownProps.params.id,
  stores: state.sc.dataStores.stores,
  store: find(state.sc.dataStores.stores, { id: ownProps.params.id }),
  editingDataStore: state.sc.dataStores.editingDataStore,
  loading: state.sc.dataStores.loading,
  loaded: state.sc.dataStores.loaded,
  error: state.sc.dataStores.error,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(storeActions, dispatch)
});

  // connect this "smart" container component to the redux store
export default connect(mapStateToProps, mapDispatchToProps)(DataStoresDetailsContainer);
