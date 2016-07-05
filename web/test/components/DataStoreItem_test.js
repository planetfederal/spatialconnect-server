'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils, { createRenderer } from 'react-addons-test-utils';
import expect from 'expect';
import { shallow } from 'enzyme';
import DataStoreItem from '../../components/DataStoreItem';
import DataStoreForm from '../../components/DataStoreForm';
import mockDataStores from '../data/mockDataStores';

describe('DataStoreItem', function() {

  function setup(props={}) {
    let defaultProps = {
      store: {},
      onSubmit: () => {}
    };
    props = Object.assign(defaultProps, props);

    const component = shallow(
      <DataStoreItem {...props} />
    );

    return {
      component: component
    };
  }

  it('should exist', function(){
    const { component } = setup();
    expect(component.type()).toBe('div')
  });

});
