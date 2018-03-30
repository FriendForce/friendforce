import styles from './Tags.less';
import React, { Component } from 'react';
import isMobile from 'ismobilejs';
import Autosuggest from 'react-autosuggest';
// TODOS:
// Make sure the first option is always ighlighted
// TODO: Make this the main entry point for creating new people

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_special_characters
const escapeRegexCharacters = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const focusInputOnSuggestionClick = !isMobile.any;

// Turn the list of infos into a list of tags
const infosToLists = infos => {
  // Turn the list of infos into a list of tags
  var tags = infos.map(x => x.tag);
  var tag_array = Array.from(new Set(tags));

  // Turn the list of infos into a list of people
  var people = infos.map(x => x.subject);
  var people_array = Array.from(new Set(people));
  return { tag_array: tag_array, people_array: people_array };
};

const peopleToPeopleArray = people => {
  // Turns list of people with ids to a list of searchable names
  var people_set = people.map(x => x.name);
  var people_array = Array.from(new Set(people_set));
  return people_array;
};

const edgesToTagArray = edges => {
  // Turns the list of edges into a list of possible tags
  var tag_set = edges.map(x => x.tag);
  var tag_array = Array.from(new Set(tag_set));
  return tag_array;
};

const getSuggestions = (value, options) => {
  const escapedValue = escapeRegexCharacters(value.trim());
  if (escapedValue === '') {
    return [];
  }
  const regex = new RegExp('^' + escapedValue, 'i');
  return options.filter(tag => regex.test(tag));
};

const getSuggestionsOld = (value, tag_array, people_array) => {
  const escapedValue = escapeRegexCharacters(value.trim());
  var options = tag_array.concat(people_array);
  if (escapedValue === '') {
    return [];
  }
  const regex = new RegExp('^' + escapedValue, 'i');
  return options.filter(tag => regex.test(tag));
};

const getSuggestionValue = suggestion => suggestion;

const renderSuggestion = suggestion => <span>{suggestion}</span>;

export default class Basic extends Component {
  constructor() {
    super();

    this.state = {
      value: '',
      suggestions: [],
      tag_array: [],
      people_array: [],
      options: []
    };
  }

  componentWillMount = value => {
    var people_array = peopleToPeopleArray(this.props.people);
    var tag_array = edgesToTagArray(this.props.edges);
    var options = tag_array.concat(people_array);
    this.setState({
      tag_array: tag_array,
      people_array: people_array,
      options: options
    });
  };

  componentWillReceiveProps = new_props => {
    // Update lists of things when props change
    var people_array = peopleToPeopleArray(new_props.people);
    var tag_array = edgesToTagArray(new_props.edges);
    var options = tag_array.concat(people_array);
    this.setState({
      tag_array: tag_array,
      people_array: people_array,
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
        <div className={styles.textContainer}>
          <div className={styles.title}>Search</div>
          <div className={styles.description}>Search for folks</div>
        </div>
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
