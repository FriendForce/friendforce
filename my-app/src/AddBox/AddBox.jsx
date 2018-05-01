import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';


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

const getSuggestionValue = (personOrTag) => {
   /**
   * Get the string to show as a suggestion value for an object
   * Currently the options or persons or tags - this might change
   * @param {personOrTag} - a Tag or a Person Object
   * @return {string} - suggestionvalue 
   */
  if (personOrTag.hasOwnProperty('label')) {
    return personOrTag.label;
  } else if (personOrTag.hasOwnProperty('name')) {
    return personOrTag.name;
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


export default class AddBox extends Component {
  constructor(props) {
    super();
    var options = uniqLabelFast(props.tags);
    this.state = {
      value: '',
      suggestions: [],
      tags:[],
      publicity:"public"
      options: options
    }
    this.onPublicityChanged = this.onPublicityChanged.bind(this);
  }

  componentWillReceiveProps = new_props => {
    // Update lists of things when props change
    var options = uniqLabelFast(new_props.tags);
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
    this.props.addTagToPerson(tag.label, this.state.publicity);
  }


  onSuggestionSelected = (event, { suggestion }) => {
    /**
     *Handle existing selection
    */
    // determine whether suggestion is a person or a tag
      // handle selected tag
    this.handleTagSelection(suggestion);
    this.setState({value:''});   
  };
  
   _handleKeyPress = e => {
    if (this.state.suggestions.length === 0 && this.state.value !== '') {
          // Handles comlete entries
      if (e.key === 'Enter') {
        console.log("publicity = " + this.state.publicity);
        this.props.addTagToPerson(this.state.value, this.state.publicity);
        this.setState({value:''});
      }
    }
  };
  
  onPublicityChanged = e => {   
    if (this.state.publicity === "private") {
      this.setState({publicity:"public"});
    } else if (this.state.publicity === "public") {
      this.setState({publicity:"private"});
    }
    
  }

  render() {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: "Add Tags!",
      value,
      onChange: this.onChange
    };

    const renderInputComponent = inputProps => {
      return(                            
        <div>
          <div className="embed-submit-field">
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
        
        <div className="form-check">
          <input checked={this.state.publicity==="private"} onChange={this.onPublicityChanged}  type="checkbox" className="form-check-input" id="exampleCheck1"/>
          <label className="form-check-label" htmlFor="exampleCheck1">Make Tag Private</label>
        </div>
        <div id="results" />
      </div>
    );
  }

}