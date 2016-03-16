'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils, { createRenderer } from 'react-addons-test-utils';
import expect from 'expect';
import DataStoresList from '../components/DataStoresList';
import DataStoreItem from '../components/DataStoreItem';
import DataStoreForm from '../components/DataStoreForm';

const dataStores = [{
  "storeId":"43ea5f5d-0e1b-40c5-80e8-c39b460a88c9",
  "name":"a new geojson store 2",
  "type":"geojson",
  "version":"1.0",
  "uri":null,
  "id":1
}];

describe('DataStoresList', function() {

  function setup(props={}) {
      let defaultProps = {
        dataStores: [],
        onSubmit: () => {}
      };
      props = Object.assign(defaultProps, props);

      // render component with shallow renering
      // see: https://facebook.github.io/react/docs/test-utils.html#shallow-rendering
      let renderer = TestUtils.createRenderer();
      renderer.render(<DataStoresList {...props} />);
      let output = renderer.getRenderOutput();
      return {props, output};
  }

  it('should exist', function(){
    const { output } = setup();
    expect(output.type).toBe('ul')
  });

  it('should render 1 data store when passed 1 store in the props', () => {
    const {output} = setup({dataStores: dataStores});
    expect(output.props.children.length).toBe(1);
    expect(output.props.children[0].props.dataStore).toBe(dataStores[0]);
  });

});

describe('DataStoreItem', function() {

  function setup(props={}) {
      let defaultProps = {
        dataStore: {},
        onSubmit: () => {}
      };
      props = Object.assign(defaultProps, props);

      // render component with shallow renering
      // see: https://facebook.github.io/react/docs/test-utils.html#shallow-rendering
      let renderer = TestUtils.createRenderer();
      renderer.render(<DataStoreItem {...props} />);
      let output = renderer.getRenderOutput();
      return {props, output};
  }

  it('should exist', function(){
    const { output } = setup();
    expect(output.type).toBe('li')
  });

  it('should render 1 data store form when passed 1 store in the props', () => {
    const {output} = setup({dataStore: dataStores[0]});
    expect(output.props.children).toBeTruthy();
  });

  it('should setup the initialValues of the form component', () => {
    const {output} = setup({dataStore: dataStores[0]});
    expect(output.props.children.props.initialValues).toBe(dataStores[0]);
  });

  it('should set the formKey as the storeId', () => {
    const {output} = setup({dataStore: dataStores[0]});
    expect(output.props.children.props.formKey).toBe(dataStores[0].storeId);
  });

});
