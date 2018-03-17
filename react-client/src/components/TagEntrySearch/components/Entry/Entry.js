import styles from './Entry.less';
import React, { Component } from 'react';
import isMobile from 'ismobilejs';
import Autosuggest from 'react-autosuggest';
//import infos from './infos';
//import { escapeRegexCharacters } from 'utils/utils';
// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_special_characters
const escapeRegexCharacters = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

//const fs = require('fs');

const focusInputOnSuggestionClick = !isMobile.any;

var tag_array = [];
var people_array = [];
var user = 'Trinity';

const infosToLists = infos => {
  // Turn the list of infos into a list of tags
  var tags = infos.map(x => x.tag);
  tag_array = Array.from(new Set(tags));

  // Turn the list of infos into a list of people
  var people = infos.map(x => x.subject);
  people_array = Array.from(new Set(people));
  return { tag_array: tag_array, people_array: people_array };
};

const getSuggestions = (value, array) => {
  const escapedValue = escapeRegexCharacters(value.trim());

  if (escapedValue === '') {
    return [];
  }

  const regex = new RegExp('^' + escapedValue, 'i');

  return array.filter(tag => regex.test(tag));
};

const getTagSuggestions = value => {
  const escapedValue = escapeRegexCharacters(value.trim());

  if (escapedValue === '') {
    return [];
  }

  const regex = new RegExp('^' + escapedValue, 'i');

  return tag_array.filter(tag => regex.test(tag));
};

const getPeopleSuggestions = value => {
  const escapedValue = escapeRegexCharacters(value.trim());

  if (escapedValue === '') {
    return [];
  }

  const regex = new RegExp('^' + escapedValue, 'i');

  return people_array.filter(person => regex.test(person));
};

const getSuggestionValue = suggestion => suggestion;

const renderSuggestion = suggestion => <span>{suggestion}</span>;

export default class Basic extends Component {
  constructor() {
    super();

    this.state = {
      value: '',
      personValue: '',
      tagValue: '',
      suggestions: [],
      tag_suggestions: [],
      people_suggestions: [],
      person: '',
      tags: [],
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
    if (method == 'enter') {
      console.log('enter pressed');
    }
  };

  onPersonChange = (event, { newValue, method }) => {
    this.setState({
      //value:newValue,
      personValue: newValue
    });
    if (method == 'enter') {
      console.log('enter pressed');
    }
  };

  onTagChange = (event, { newValue, method }) => {
    this.setState({
      //value: newValue,
      tagValue: newValue
    });
    if (method == 'enter') {
      console.log('enter pressed');
    }
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getTagSuggestions(value)
    });
  };

  onTagSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      tag_suggestions: getSuggestions(value, this.state.tag_array)
    });
  };

  onPeopleSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      people_suggestions: getSuggestions(value, this.state.people_array)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  onPeopleSuggestionsClearRequested = () => {
    this.setState({
      people_suggestions: []
    });
  };

  onTagSuggestionsClearRequested = () => {
    this.setState({
      tag_suggestions: []
    });
  };

  onPeopleSuggestionSelected = (event, { suggestion }) => {
    console.log('Set person to: ' + suggestion);
    // Check if you're changing people
    if (this.state.person != suggestion) {
      // if you're changing people pull up all the tags associated with that person
      console.log('changing person');
      this.setState({ tags: [] });
    }
    this.setState({ personValue: '', person: suggestion });
  };

  onTagSuggestionSelected = (event, { suggestion }) => {
    console.log('Add tag: ' + suggestion);
    var temp_array = this.state.tags.slice();
    temp_array.push(suggestion);
    this.setState({ tagValue: '', tags: temp_array });
    // add to the person
    if (this.state.person.length > 0) {
      this.props.addInfo({
        subject: this.state.person,
        originator: user,
        tag: suggestion,
        timestamp: Date().toString()
      });
    }
  };

  //This handles entering a new tag
  _handleTagKeyPress = e => {
    if (e.key === 'Enter' && !this.state.tag_array.includes(e.target.value)) {
      var new_tag = e.target.value;
      var temp_array = this.state.tags.slice();
      temp_array.push(new_tag);
      this.setState({ tagValue: '', tags: temp_array });
      if (this.state.person.length > 0) {
        console.log('creating new person with tag');
        this.props.addInfo({
          subject: this.state.person,
          originator: user,
          tag: new_tag,
          timestamp: Date().toString()
        });
        console.log(this.props.infos);
      }
      var lists = infosToLists(this.props.infos);
      this.setState({
        tag_array: lists['tag_array'],
        people_array: lists['people_array']
      });
      console.log(this.state.tag_array);
      this.setState({ tagValue: '' });
    }
  };
  // TODO: make sure that you change people and tags both based on
  // list and based on new thing
  _handlePersonKeyPress = e => {
    if (e.key == 'Enter' && !this.state.people_array.includes(e.target.value)) {
      console.log('new person entered: ' + e.target.value);
      var person = e.target.value;
      this.setState({ person: person });
      this.setState({ personValue: '' });
      this.setState({ tags: [] });
    }
  };

  render() {
    const {
      value,
      personValue,
      tagValue,
      suggestions,
      tag_suggestions,
      people_suggestions,
      person,
      tags,
      tag_array,
      people_array
    } = this.state;

    const inputProps = {
      placeholder: "Type 'c'",
      value,
      onChange: this.onChange
    };

    const personInputProps = {
      placeholder: 'Type a Person',
      value: this.state.personValue,
      onChange: this.onPersonChange
    };

    const tagInputProps = {
      placeholder: 'Type a Tag',
      value: this.state.tagValue,
      onChange: this.onTagChange
    };

    const renderTagInputComponent = inputProps => (
      <div>
        <input {...inputProps} onKeyPress={this._handleTagKeyPress} />
        <div>
          <b>Tags:</b>
          {this.state.tags.join(', ')}
        </div>
      </div>
    );

    const renderPersonInputComponent = inputProps => (
      <div>
        <input {...inputProps} onKeyPress={this._handlePersonKeyPress} />
        <div>
          <b>Person:</b>
          {this.state.person}
        </div>
      </div>
    );

    return (
      //Finding Tags
      <div id="entry-example" >
        <div id="name-entry" className={styles.container}>
          <div className={styles.textContainer}>
            <div className={styles.title}>Entry</div>
            <div className={styles.description}>Enter Names</div>
          </div>
          <div >
            <Autosuggest className={styles.autosuggest}
              suggestions={people_suggestions}
              onSuggestionsFetchRequested={
                this.onPeopleSuggestionsFetchRequested
              }
              onSuggestionsClearRequested={this.onSuggestionsClearRequested}
              getSuggestionValue={getSuggestionValue}
              onSuggestionSelected={this.onPeopleSuggestionSelected}
              renderSuggestion={renderSuggestion}
              renderInputComponent={renderPersonInputComponent}
              inputProps={personInputProps}
              focusInputOnSuggestionClick={focusInputOnSuggestionClick}
              id="name-entry"
            />
          </div>
          <div  id="people-results" />
        </div>
        <div id="tag-entry" >
          <div >
            <div >Enter Tags</div>
          </div>
          <div>
            <Autosuggest className={styles.autosuggest}
              suggestions={tag_suggestions}
              onSuggestionsFetchRequested={this.onTagSuggestionsFetchRequested}
              onSuggestionsClearRequested={this.onTagSuggestionsClearRequested}
              getSuggestionValue={getSuggestionValue}
              onSuggestionSelected={this.onTagSuggestionSelected}
              renderSuggestion={renderSuggestion}
              renderInputComponent={renderTagInputComponent}
              inputProps={tagInputProps}
              focusInputOnSuggestionClick={focusInputOnSuggestionClick}
              id="tags-entry"
            />
          </div>
          <div  id="tag-results" />
        </div>
      </div>
    );
  }
}
