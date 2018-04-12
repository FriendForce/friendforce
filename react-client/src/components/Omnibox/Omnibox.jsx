import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import styles from './Omnibox.less';
import isMobile from 'ismobilejs';


const focusInputOnSuggestionClick = !isMobile.any;


const personsToNameArray = persons => {
  // Turns list of people with ids to a list of searchable names
  var person_set = persons.map(x => x.name);
  var person_array = Array.from(new Set(person_set));
  return person_array;
};

const tagsToLabelArray = tags => {
  // Turns the list of edges into a list of possible tags
  var label_set = tags.map(x => x.label);
  var label_array = Array.from(new Set(label_set));
  return label_array;
};

const escapeRegexCharacters = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getSuggestionValue = (object) => {
  if (object.hasOwnProperty('label')) {
    return object.label;
  } else if (object.hasOwnProperty('name')) {
    return object.name;
  }
}

const getSuggestions = (value, options) => {
  const escapedValue = escapeRegexCharacters(value.trim());
  if (escapedValue === '') {
    return [];
  }
  const regex = new RegExp('^' + escapedValue, 'i');
  return options.filter(tag_or_person => regex.test(getSuggestionValue(tag_or_person)));
};


const renderSuggestion = suggestion => <span>{getSuggestionValue(suggestion)}</span>;


export default class OmniBox extends Component {
  constructor() {
    super();
    this.state = {
      value: '',
      suggestions: [],
    }
  }

  componentWillMount = value => {
    var options = this.props.persons.concat(this.props.tags);
    this.setState({
      options: options
    });
  };

  componentWillReceiveProps = new_props => {
    // Update lists of things when props change
     var options = this.props.persons.concat(new_props.tags);
    this.setState({
      options: options
    });
  };

  onChange = (event, { newValue, method }) => {
    this.setState({
      value: newValue
    });
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value, this.state.options)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  onSuggestionSelected = (event, { suggestion }) => {
    /**
     *Handle existing selection
    */
    // determine whether suggestion is a person or a tag

    var relevant_edges = this.props.edges.filter(
      edge => edge.tag == suggestion
    );
    var relevant_ids = relevant_edges.map(id => id.subject);
    var relevant_names = [];
    for (var i = 0; i < relevant_ids.length; i++) {
      var person = this.props.people.filter(
        person => person.id === relevant_ids[i]
      )[0];
      var name = person['name'];
      relevant_names.push(name);
    }
    var html =
      '<p> Relevant People! </p> <p>' + relevant_names.join('</p><p>') + '</p>';
    document.getElementById('results').innerHTML = html;
  };

   _handleKeyPress = e => {
    // Handles comlete entries
    if (e.key === 'Enter') {
      var relevant_edges = this.props.edges.filter(
        edge => edge.tag == e.target.value
      );
      var relevant_ids = relevant_edges.map(id => id.subject);
      var relevant_names = [];
      for (var i = 0; i < relevant_ids.length; i++) {
        var person = this.props.people.filter(
          person => person.id === relevant_ids[i]
        )[0];
        var name = person['name'];
        relevant_names.push(name);
      }
      var html =
        '<p> Relevant People! </p> <p>' +
        relevant_names.join('</p><p>') +
        '</p>';
      document.getElementById('results').innerHTML = html;
    }
  };

  render() {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: "Type 'c'",
      value,
      onChange: this.onChange
    };

    const renderInputComponent = inputProps => (
      <div>
        <input {...inputProps} onKeyPress={this._handleKeyPress} />
        <div>custom stuff</div>
      </div>
    );

    return (
      //Finding Tags
      <div id="tags-example" className={styles.container}>
        <div className={styles.autosuggest}>
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            onSuggestionSelected={this.onSuggestionSelected}
            renderSuggestion={renderSuggestion}
            renderInputComponent={renderInputComponent}
            inputProps={inputProps}
            focusInputOnSuggestionClick={focusInputOnSuggestionClick}
            id="tags-example"
          />
        </div>
        <div className={styles.description} id="results" />
      </div>
    );
  }

}