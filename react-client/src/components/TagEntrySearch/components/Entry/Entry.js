import styles from './Entry.less';
import React, { Component } from 'react';
import isMobile from 'ismobilejs';
import Autosuggest from 'react-autosuggest';

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_special_characters
const escapeRegexCharacters = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const uuid = foo => {
  // Get a random uuid
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};

const focusInputOnSuggestionClick = !isMobile.any;

var tag_array = [];
var people_array = [];
var user = 'Trinity';

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
      personValue: '', //Value in the person box
      tagValue: '', //Value in the tag box
      tag_suggestions: [],
      people_suggestions: [],
      person: { id: 0, name: '' },
      tags: [],
      tag_array: [],
      people_array: []
    };
  }

  componentWillMount = value => {
    var people_array = peopleToPeopleArray(this.props.people);
    var tag_array = edgesToTagArray(this.props.edges);
    this.setState({
      tag_array: tag_array,
      people_array: people_array
    });
  };

  componentWillReceiveProps = new_props => {
    console.log('entry props updated');
    var people_array = peopleToPeopleArray(new_props.people);
    var tag_array = edgesToTagArray(new_props.edges);
    this.setState({
      tag_array: tag_array,
      people_array: people_array
    });
    console.log(tag_array);
    console.log(this.state.tag_array);
  };

  findTagsForPerson = person => {
    var edges = this.props.edges.filter(edge => edge.subject == person.id);
    var tags = edges.map(x => x.tag);
    return tags;
  };

  onPersonChange = (event, { newValue, method }) => {
    this.setState({
      //TODO: if it is a new person, assign them an id
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
    // This assumes there's only one person with the name
    // needs to change as it scales
    console.log('people suggestoion: ' + suggestion);
    var person = this.props.people.filter(
      person => person.name == suggestion
    )[0];
    // Check if you're changing people
    if (this.state.person != person) {
      // if you're changing people pull up all the tags associated with that person
      console.log('changing person');
      this.setState({ tags: this.findTagsForPerson(person) });
    }
    this.setState({ personValue: '', person: person });
  };

  onTagSuggestionSelected = (event, { suggestion }) => {
    // add to the person
    if (this.state.person.name.length > 0) {
      console.log('Add tag: ' + suggestion);
      this.props.addEdge({
        subject: this.state.person.id,
        originator: this.props.user.id,
        tag: suggestion,
        // TODO: turn into firebase class
        timestamp: Date().toString()
      });
      // This is mostly for speed, would it be better
      // to regen tag list?
      var temp_array = this.state.tags.slice();
      temp_array.push(suggestion);
      this.setState({ tagValue: '', tags: temp_array });
    } else {
      console.log('need to add tags to people');
    }
  };

  //This handles entering a new tag
  _handleTagKeyPress = e => {
    if (
      e.key === 'Enter' &&
      !this.state.tag_array.includes(e.target.value) &&
      e.target.value.length > 0
    ) {
      // Should it be legit to create a tag without a person? Why not?
      var new_tag = e.target.value;
      this.props.addEdge({
        subject: this.state.person.id,
        originator: this.props.user.id,
        tag: new_tag,
        // TODO: replace Date with firebase class
        timestamp: Date().toString()
      });
      if (this.state.person.name.length > 0) {
        var temp_array = this.state.tags.slice();
        temp_array.push(new_tag);
        this.setState({ tagValue: '', tags: temp_array });
      }
      this.setState({ tagValue: '' });
    }
  };
  // TODO: make sure that you change people and tags both based on
  // list and based on new thing
  _handlePersonKeyPress = e => {
    if (e.key == 'Enter' && e.target.value.length > 0) {
      // Check if new person
      console.log('entered name: ' + e.target.value);
      var matches = this.props.people.filter(
        person => person.name === e.target.value
      );
      console.log('people matches ' + matches);
      if (matches.length == 0) {
        console.log('new person entered: ' + e.target.value);
        var person = {
          name: e.target.value,
          id: uuid()
        };
        this.setState({ person: person });
        this.setState({ personValue: '' });
        this.setState({ tags: [] });
        this.props.addPerson(person);
      } else {
        var person = this.props.people.filter(
          person => person.name == e.target.value
        )[0];
        // Check if you're changing people
        if (this.state.person != person) {
          // if you're changing people pull up all the tags associated with that person
          console.log('changing person');
          this.setState({ tags: this.findTagsForPerson(person) });
        }
        this.setState({ personValue: '', person: person });
      }
    }
  };

  render() {
    const {
      personValue,
      tagValue,
      tag_suggestions,
      people_suggestions,
      person,
      tags,
      tag_array,
      people_array
    } = this.state;
    
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
          {this.state.person.name}
        </div>
      </div>
    );

    return (
      //Finding Tags
      <div id="entry-example">
        <div id="name-entry" className={styles.container}>
          <div className={styles.textContainer}>
            <div className={styles.title}>Entry</div>
            <div className={styles.description}>Enter Names</div>
          </div>
          <div className={styles.autosuggest}>
            <Autosuggest
              suggestions={people_suggestions}
              onSuggestionsFetchRequested={
                this.onPeopleSuggestionsFetchRequested
              }
              onSuggestionsClearRequested={
                this.onPeopleSuggestionsClearRequested
              }
              getSuggestionValue={getSuggestionValue}
              onSuggestionSelected={this.onPeopleSuggestionSelected}
              renderSuggestion={renderSuggestion}
              renderInputComponent={renderPersonInputComponent}
              inputProps={personInputProps}
              focusInputOnSuggestionClick={focusInputOnSuggestionClick}
              id="name-entry"
            />
          </div>
          <div className={styles.description} id="people-results" />
        </div>
        <div id="tag-entry" className={styles.container}>
          <div className={styles.textContainer}>
            <div className={styles.description}>Enter Tags</div>
          </div>
          <div className={styles.autosuggest}>
            <Autosuggest
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
          <div className={styles.description} id="tag-results" />
        </div>
      </div>
    );
  }
}
