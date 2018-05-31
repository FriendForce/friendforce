import React, { Component } from 'react';
import TagButton from './TagButton.jsx';
import { Row} from 'reactstrap';


export default class PersonBox extends Component {
  // TODO - look at the tags for this person and display the info tags 
  constructor(props) {
    super(props);
    this.specialTypes = ["email", "date"];
    this.state = {
      tags: props.tags.filter(tag=>this.specialTypes.indexOf(tag.type)<0),
      uniqueTags: props.tags.filter(tag=>this.specialTypes.indexOf(tag.type)>-1)
    }
    this.setTag = this.props.setTag.bind(this);
    
  }

  componentWillReceiveProps = new_props => {
    // Update lists of things when props change
    this.filterTags(new_props.tags);
  };

  filterTags = (tags) => {
    this.setState({
      tags: tags.filter(tag=>this.specialTypes.indexOf(tag.type)<0),
      uniqueTags: tags.filter(tag=>this.specialTypes.indexOf(tag.type)>-1)
    })
  }

  createUniqueTagElement = (tag) => {
    var info = tag.label.split(":")[1];
    var name = tag.label.split(":")[0];
    var infoElement = name+":"+info;
    if (tag.type === "email") {
      var mailToString = "mailto"+info;
      infoElement = <div>{name} :<a key={tag.label} href={mailToString}>{info}</a></div>
    }
    return(infoElement);
  }

  //TODO: Add showing special things 

  render() {
    var person = this.props.person;
    var name = "";
    if (person.length > 0) {
      name = person[0].name;
    } 
    var uniqueTagButtons = [];
    this.state.uniqueTags.forEach(tag=>{
      uniqueTagButtons.push(
      <Row key={tag.label}> 
      {this.createUniqueTagElement(tag)}
      </Row>
      );
    });
    var tagButtons = [];
    this.state.tags.forEach(tag=>{
      tagButtons.push( <TagButton key={tag.label} tag={tag} setTag={this.setTag}/>);
    });
    return(
      <div>
        <h2>{name}</h2>
        {tagButtons}
        {uniqueTagButtons}
      </div>
    );
  }
}
