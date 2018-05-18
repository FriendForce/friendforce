import React, { Component } from 'react';
import MiniPerson from './Search/MiniPerson.jsx';
import { Container, Row} from 'reactstrap';

export default class PersonList extends Component {
  // eslint-disable-next-line
  constructor(props) {
    super(props);
  }

  addTag = (person) => { 
    console.log("checked " + person.name);
    /*
    var labels = this.props.labels;
    labels.forEach(label=>{
      this.props.addTag(label, person.id)
    });
    */
  }

  // TODO
  // Make it so you can select a tag (/all_people+tag)?
  // And then go down the list of people and hit enter on them 

  render() {
    var persons = [];
    this.props.persons.forEach((person) => {
      var link = "/person/" + person.id;
      persons.push(
                   <Row key={person.name}>
                      <input onClick={()=>{this.addTag(person)}}  type="checkbox" className="form-check-input"/>
                      <div onKeyDown={(e)=>{this.addTag}} tabIndex="0">
                      <MiniPerson key={person.name} person={person} link={link}  />
                      </div>
                    </Row>
      );
    });
    return(
           <div>
            <Container>
              {persons}
            </Container>
           </div>
    );
  }

}