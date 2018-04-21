import React, { Component } from 'react';
import {
  Route,
} from 'react-router-dom'

const getSearchLabels =(searchString) => {
  return searchString.split("+");
}

const uniqIdFast = a => {
  /**
   * Quickly makes a list tags without repeating labels
   * @param a {[Tag]} list of tags
   */

    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
         var item = a[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }
    return out;
}


export default class Search extends Component {
  constructor() {
    super();
  }

  getMatchingPersons = () => {
    var searchLabels = getSearchLabels(this.props.searchString);
    var matchingTags = [];
    var potentialMatchingPersons = [];
    var matchingPersons = [];
    for (var i = 0; i < searchLabels.length; i++) {
      matchingTags.push(this.props.tags.filter(tag => 
        {tag.label === searchLabels[i]}));
    }

    console.log(matchingTags);
    for (var i = 0; i < searchLabels.length; i++) {
      potentialMatchingPersons.push(
        matchingTags[i].map(tag => tag.subject));
    }
    console.log(potentialMatchingPersons);
    // Persons must have all search terms to pass (for now)
    potentialMatchingPersons[0].forEach(personId => {
      var num_matches = potentialMatchingPersons.filter(personList => {
        personList.indexOf(personId) > -1
      });
      if (num_matches === searchLabels.length) {
        matchingPersons.push(personId);
      }
    });
    return potentialMatchingPersons;
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
