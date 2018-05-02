import React, { Component } from 'react';
import TagButton from './TagButton.jsx';



export default class Person extends Component {
  // TODO - look at the tags for this person and display the info tags 
  constructor(props) {
    super(props);

    this.setTag = this.props.setTag.bind(this);

  }

  render() {
    var person = this.props.persons.filter(person=>person.id === this.props.personId);
    var name = "";
    if (person.length > 0) {
      name = person[0].name;
    } 
    var tags = this.props.tags.filter(tag=>(tag.subject === this.props.personId));
    var tagButtons = [];
    tags.forEach(tag=>{
      tagButtons.push( <TagButton key={tag.label} tag={tag} setTag={this.setTag}/>);
    });
    return(
      <div>
        <h2>Person: {name}</h2>
        {tagButtons}
      </div>
    );
  }
}
