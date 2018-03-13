
import React, { Component } from 'react';
import isMobile from 'ismobilejs';
import Autosuggest from 'react-autosuggest';
//import infos from './infos';
//import { escapeRegexCharacters } from 'utils/utils';

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_special_characters
const escapeRegexCharacters = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');


const focusInputOnSuggestionClick = !isMobile.any;

// Turn the list of infos into a list of tags
/*
var tags = infos.map(x => x.tag);
console.log(tags);
var tag_array = Array.from(new Set(tags));
console.log(tag_array);
*/
const infosToLists = infos => {
  // Turn the list of infos into a list of tags
  var tags = infos.map(x => x.tag);
  var tag_array = Array.from(new Set(tags));

  // Turn the list of infos into a list of people
  var people = infos.map(x => x.subject);
  var people_array = Array.from(new Set(people));
  return { tag_array: tag_array, people_array: people_array };
};

const getTagSuggestions = (value, tag_array) => {
  const escapedValue = escapeRegexCharacters(value.trim());

  if (escapedValue === '') {
    return [];
  }

  const regex = new RegExp('^' + escapedValue, 'i');

  return tag_array.filter(tag => regex.test(tag));
};

const getSuggestions = (value, tag_array, people_array) => {
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
      people_array: []
    };
  }

  componentWillMount = value => {
    var lists = infosToLists(this.props.infos);
    this.setState({
      tag_array: lists['tag_array'],
      people_array: lists['people_array']
    });
  };

  componentWillReceiveProps = new_props => {
    var lists = infosToLists(new_props.infos);
    this.setState({
      tag_array: lists['tag_array'],
      people_array: lists['people_array']
    });
  };

  onChange = (event, { newValue, method }) => {
    this.setState({
      value: newValue
    });
    console.log('method is: ' + method);
    if (method == 'enter') {
      console.log('enter pressed');
    }
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(
        value,
        this.state.tag_array,
        this.state.people_array
      )
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  onSuggestionSelected = (event, { suggestion }) => {
    console.log('Selected ' + suggestion);
    var relevant_infos = this.props.infos.filter(
      info => info.tag == suggestion
    );
    console.log(
      'relevant_poepple = ' + relevant_infos.map(name => name.subject)
    );
    var html =
      '<p> Relevant People! </p> <p>' +
      relevant_infos.map(name => name.subject).join('</p><p>') +
      '</p>';
    document.getElementById('results').innerHTML = html;
  };

  _handleKeyPress = e => {
    if (e.key === 'Enter') {
      console.log('new tag entered: ' + e.target.value);
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
      <div id="tags-example" >
        <div   >
          <div   >Search</div>
          <div   >Search for folks</div>
        </div>
        <div   >
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
        <div    id="results" />
      </div>
    );
  }
}
