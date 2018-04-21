import React, { Component } from 'react';
import {
  Route,
} from 'react-router-dom'

class Search extends Component {
  constructor({match}) {
    super();
    this.match = match;
  }
  render() {
    return(
      <div>
        <h2>Search: {this.match.params.searchString}</h2>
      </div>
    );
  }
}

const SearchBox = ({ match }) => (
    <Route path={`${match.path}/:searchString`} component={Search}/>

)

export default SearchBox