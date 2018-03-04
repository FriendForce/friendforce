import '../../test/test_setup'
import {shallow, mount} from 'enzyme';
import React from 'react';

import ListItem from './ListItem';

describe('ListItem', () => {
  it('can be created without throwing', () => {
    const listItem = shallow(
      <ListItem item="A" />
    );
    expect(listItem.text()).toEqual('A');
  })
})
