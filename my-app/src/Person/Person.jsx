import React, { Component } from 'react';
import {
  Route,
} from 'react-router-dom'

export default class Person extends Component {
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
