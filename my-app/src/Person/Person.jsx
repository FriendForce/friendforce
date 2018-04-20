import React, { Component } from 'react';
import {
  Route,
} from 'react-router-dom'

class Person extends Component {
  constructor({match}) {
    super();
    this.match = match;
  }
  render() {
    return(
      <div>
        <h2>Person: {this.match.params.personId}</h2>
      </div>
    );
  }
}

const PersonBox = ({ match }) => (
    <Route path={`${match.path}/:personId`} component={Person}/>

)

export default PersonBox