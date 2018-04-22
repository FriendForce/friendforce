import React, { Component } from 'react';

export default class Person extends Component {
  // eslint-disable-next-line
  constructor() {
    super();
  }
  render() {
    return(
      <div>
        <h2>Person: {this.props.personId}</h2>
      </div>
    );
  }
}
