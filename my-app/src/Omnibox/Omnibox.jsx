import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import SearchButton from './SearchButton.jsx';
//import isMobile from 'ismobilejs';


//const focusInputOnSuggestionClick = !isMobile.any;
const uniqLabelFast = a => {
  /**
   * Quickly makes a list tags without repeating labels
   * @param a {[Tag]} list of tags
   */

    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
         var item = a[i].label;
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = a[i];
         }
    }
    return out;
}

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


const renderSuggestion = (suggestion, {query}) => {
  var img = 'none';
  if (suggestion.hasOwnProperty('label')) {
    img = 'TAG';
  } else if (suggestion.hasOwnProperty('name')) {
    img = 'PERSON';
  }
  return(
         //TODO: how do you get theme classes in?
    <span className='sugestionContent'>{getSuggestionValue(suggestion) + ' ' + img}</span>
    );
}


export default class OmniBox extends Component {
  constructor() {
    super();
    this.state = {
      value: '',
      suggestions: [],
      tags:[],
    }
  }

  componentWillMount = value => {
    var options = this.props.persons.concat(uniqLabelFast(this.props.tags));
    this.setState({
      options: options
    });

  };

  componentWillReceiveProps = new_props => {
    // Update lists of things when props change
    var options = new_props.persons.concat(uniqLabelFast(new_props.tags));
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
  }

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
      <div id="tags-example">
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
            id="tags-example"
          />
        </div>
        <div id="results" />
      </div>
    );
  }

}