'use strict';
import React, {
  AppRegistry,
  Component,
  ListView,
  StyleSheet,
  Text,
  View
} from 'react-native';

var REQUEST_URL = 'http://10.0.1.9:3000/api/configs';

class ExampleProject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      loaded: false
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    fetch(REQUEST_URL)
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(responseData),
          loaded: true
        });
      })
      .done();
  }

  render() {
    if (!this.state.loaded) {
      return this.renderLoadingView();
    }

    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow={this.renderStore}
        style={styles.listView}
      />
    );
  }

  renderLoadingView() {
    return (
      <View style={styles.container}>
        <Text>
          Loading stores...
        </Text>
      </View>
    );
  }

  renderStore(store) {
    return (
      <View style={styles.container}>
        <View style={styles.mainItem}>
          <Text style={styles.name}>{store.name}</Text>
          <Text style={styles.property}>ID: {store.id}</Text>
          <Text style={styles.property}>Type: {store.type}</Text>
          <Text style={styles.property}>Version: {store.version}</Text>
          <Text style={styles.property}>URI: {store.uri}</Text>
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#FFFFFF',
    borderWidth: 3
  },
  mainItem: {
    flex: 1,
    borderWidth: 1
  },
  name: {
    fontSize: 20,
    textAlign: 'left',
    backgroundColor: '#29728C',
    padding: 5
  },
  property: {
    fontSize: 10,
    textAlign: 'left',
    padding: 3,
    marginLeft: 6
  },
  listView: {
    paddingTop: 20,
  },
});

AppRegistry.registerComponent('ExampleProject', () => ExampleProject);
