'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils, { createRenderer } from 'react-addons-test-utils';
import expect from 'expect';
import { shallow } from 'enzyme';
import DataStoresList from '../../components/DataStoresList';
import DataStoreItem from '../../components/DataStoreItem';
import dataStores from '../data/mockDataStores';

describe('DataStoresList', function() {

  function setup(props={}) {
    let defaultProps = {
      dataStores: [],
      onSubmit: () => {}
    };
    props = Object.assign(defaultProps, props);

    const component = shallow(
      <DataStoresList {...props} />
    );

    return {
      component: component
    };
  }

  it('should render correctly', function(){
    const { component } = setup();
    expect(component.type()).toBe('ul')
  });

  it('should render 1 data store list when passed 1 store in the props', () => {
    const {component} = setup({dataStores: dataStores});
    expect(component.find(DataStoreItem).length).toBe(1);
  });

  it('should set the dataStore prop of the data store', () => {
    const {component} = setup({dataStores: dataStores});
    expect(component.find(DataStoreItem).at(0).props().dataStore).toBe(dataStores[0]);
  });

});
