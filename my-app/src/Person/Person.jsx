import React, { Component } from 'react';

export default class Person extends Component {
  // eslint-disable-next-line
  constructor() {
    super();
  }
  render() {
    var tags = this.props.tags.filter(tag=>(tag.subject === this.props.personId));
    var tagButtons = [];
    tags.forEach(tag=>{
      tagButtons.push( <button key={tag.label} type="tag">{tag.label}</button>);
    });
    return(
      <div>
        <h2>Person: {this.props.personId}</h2>
        {tagButtons}
      </div>
    );
  }
}
