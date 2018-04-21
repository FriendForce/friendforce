import React, { Component } from 'react';

const getSearchLabels =(searchString) => {
  var labels = searchString.split("+");
  var formattedLabels = [];
  labels.forEach(label => {
    label.replace("%"," "); formattedLabels.push(label);});
  return formattedLabels;
}

export default class Search extends Component {
  // eslint-disable-next-line
  constructor() {
    super();
  }

  getMatchingPersons = () => {
    var searchLabels = getSearchLabels(this.props.searchString);
    var matchingTags = [];
    var potentialMatchingPersons = [];
    var matchingPersons = [];

    for (var i = 0; i < searchLabels.length; i++) {
          // eslint-disable-next-line
      var tags = this.props.tags.filter(tag => 
        tag.label === searchLabels[i]);
      matchingTags.push(tags);
    }
    matchingTags.forEach(tags => {
      potentialMatchingPersons.push(
        tags.map(tag => tag.subject));
    });
    // Persons must have all search terms to pass (for now)
    potentialMatchingPersons[0].forEach(person => {
      var match = true;
      for (var i = 0; i < potentialMatchingPersons.length; i++) {
        if (potentialMatchingPersons[i].indexOf(person) < 0) {
          match = false;
          break;
        }
      }
      if (match === true) {
        matchingPersons.push(person);
      }
    });
    return matchingPersons;
  }


  render() {
    var searchLabels = getSearchLabels(this.props.searchString);
    var matchingPersons = this.getMatchingPersons();
    return(
      <div>
        <h2>Searching for matches to tags: </h2>
        <h4>{searchLabels}</h4>
        <h2>Resulting People</h2>
        <h4>{matchingPersons}</h4>
      </div>
    );
  }
}
