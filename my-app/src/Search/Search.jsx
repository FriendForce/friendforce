import React, { Component } from 'react';
import MiniPerson from './MiniPerson.jsx';
import { Container, Row} from 'reactstrap';


export default class Search extends Component {
  // eslint-disable-next-line
  constructor() {
    super();
  }

  getMatchingIds = () => {
    var searchLabels = this.props.searchLabels;
    var matchingTags = [];
    var potentialMatchingIds = [];
    var matchingIds = [];

    for (var i = 0; i < searchLabels.length; i++) {
          // eslint-disable-next-line
      var tags = this.props.tags.filter(tag => 
        tag.label === searchLabels[i]);
      matchingTags.push(tags);
    }
    matchingTags.forEach(tags => {
      potentialMatchingIds.push(
        tags.map(tag => tag.subject));
    });
    // Persons must have all search terms to pass (for now)
    potentialMatchingIds[0].forEach(person => {
      var match = true;
      for (var i = 0; i < potentialMatchingIds.length; i++) {
        if (potentialMatchingIds[i].indexOf(person) < 0) {
          match = false;
          break;
        }
      }
      if (match === true) {
        matchingIds.push(person);
      }
    });
    return matchingIds;
  }


  render() {
    var matchingIds = this.getMatchingIds();

    var matchingPersons = this.props.persons.filter(person=>(matchingIds.indexOf(person.id) > -1));
    let content = [];
    matchingPersons.forEach(person => {
      var link = "/person/"+person.id;
      content.push(
                   <Row key={person.name}>
                    <MiniPerson key={person.name} person={person} link={link}/>
                   </Row>
                   );
    });
    return(
      <div>
        <Container>
        <h2>Resulting People</h2>
        {content}
        </Container>
      </div>
    );
  }
}
