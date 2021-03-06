import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import SearchButton from './SearchButton.jsx';
//import isMobile from 'ismobilejs';


//const focusInputOnSuggestionClick = !isMobile.any;

const escapeRegexCharacters = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getSuggestionValue = (object) => {
     /**
   * Get the string to show as a suggestion value for an object
   * Currently the options or persons or tags - this might change
   * @param {personOrTag} - a Tag or a Person Object
   * @return {string} - suggestionvalue 
   */
  if (object.hasOwnProperty('label')) {
    return object.label;
  } else if (object.hasOwnProperty('name')) {
    return object.name;
  } else if (typeof(object) === "string") {
    return object;
  }
}

const getSuggestions = (value, options) => {
  const escapedValue = escapeRegexCharacters(value.trim());
  if (escapedValue === '') {
    return [];
  }
  const regex = new RegExp(escapedValue, 'i');
  return options.filter(tag_or_person => regex.test(getSuggestionValue(tag_or_person)));
};


const renderSuggestion = (suggestion, {query}) => {
  var img = 'none';
  if (suggestion.hasOwnProperty('label')) {
    img = 'TAG';
  } else if (suggestion.hasOwnProperty('name')) {
    img = 'PERSON';
  } else if (typeof(object) === "string") {
    img = 'TAG';
  }
  return(
         //TODO: how do you get theme classes in?
    <span className='sugestionContent'>{getSuggestionValue(suggestion) + ' ' + img}</span>
    );
}


export default class OmniBox extends Component {
  constructor(props) {
    super(props);
    var options = props.persons.concat(props.labels);
    this.state = {
      value: '',
      suggestions: [],
      options: options
    }
  }


  componentWillReceiveProps = new_props => {
    // Update lists of things when props change
    var options = new_props.persons.concat(new_props.labels);
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

  handleTagSelection = (tag) => {
    this.props.setTag(tag);
  };

  handleLabelSelection = (label) => {
    this.props.setLabel(label);
  };


  handlePersonSelection = (person) => {
     this.props.setPerson(person);
  }

  onSuggestionSelected = (event, { suggestion }) => {
    /**
     *Handle existing selection
    */
    // determine whether suggestion is a person or a tag
    if (suggestion.hasOwnProperty('label')) {
      // handle selected tag
      this.handleTagSelection(suggestion);
    } else if (suggestion.hasOwnProperty('name')) {
      // handle selected person
      this.handlePersonSelection(suggestion);
    } else if (typeof(suggestion) === "string") {
      this.handleLabelSelection(suggestion);
    }
    this.setState({value:''});   
  };
  
   _handleKeyPress = e => {
    if (this.state.suggestions.length === 0 && this.state.value !== '') {
          // Handles comlete entries
      if (e.key === 'Enter') {
        this.props.addPerson(this.state.value);
        this.setState({value:''});
      }
    }
  };
  
  render() {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: "Type a name or a tag!",
      value,
      onChange: this.onChange
    };

    const renderInputComponent = inputProps => {
      var tagButtons = [];                                        
      this.props.searchLabels.forEach(label => {
        tagButtons.push( <SearchButton key={label} unsetLabel={this.props.unsetLabel} label={label}/>);
      });
      return(                            
        <div>
          <div className="embed-submit-field">
          {tagButtons}
          <input {...inputProps} onKeyPress={this._handleKeyPress} />
          <div id='results' />
          </div>
        </div>
        );
    };

    return (
      //Finding Tags
      <div id="searchBox">
        <div>
          
          <Autosuggest
            highlightFirstSuggestion={true}
            suggestions={suggestions}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            onSuggestionSelected={this.onSuggestionSelected}
            renderSuggestion={renderSuggestion}
            renderInputComponent={renderInputComponent}
            inputProps={inputProps}
            //focusInputOnSuggestionClick={focusInputOnSuggestionClick}
            id="searchBox"
          />
        </div>
        <div id="results" />
      </div>
    );
  }

}