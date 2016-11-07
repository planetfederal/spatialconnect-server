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
    if (!this.props.store) {
      this.props.actions.loadDataStore(this.props.id);
    }
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
    const { stores, store, loading, loaded, error, storeErrors, layerList } = this.props;
    let el = <div></div>;
    if (loading) {
      el = <p>Fetching Store...</p>;
    } else {
      if (error) {
        el = <p>Store Not Found</p>;
      }
      if (loaded && store) {
        this.title = store.name;
        if (this.state.editingDataStore) {
          el = <DataStoreForm
                store={store}
                errors={storeErrors}
                layerList={layerList}
                actions={this.props.actions}
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
      <div className="data-store-details">
        {el}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  id: ownProps.params.id,
  stores: state.sc.dataStores.stores,
  store: find(state.sc.dataStores.stores, { id: ownProps.params.id }),
  editingDataStore: state.sc.dataStores.editingDataStore,
  loading: state.sc.dataStores.loading,
  loaded: state.sc.dataStores.loaded,
  error: state.sc.dataStores.error,
  storeErrors: state.sc.dataStores.storeErrors,
  layerList: state.sc.dataStores.layerList
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(storeActions, dispatch)
});

  // connect this "smart" container component to the redux store
export default connect(mapStateToProps, mapDispatchToProps)(DataStoresDetailsContainer);
