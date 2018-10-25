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
  return options.filter(tag_or_person => regex.test(getSuggestionValue(tag_or_person))).sort();
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
      options: options,
      numEscPressed: 0,
    }
    this.onEsc = this._onEsc.bind(this);
  }


  componentWillReceiveProps = new_props => {
    // Update lists of things when props change
    if (new_props.searchLabels.length > 0) {
      var options = new_props.labels;
    } else {
      var options = new_props.persons.concat(new_props.labels);
    }

    this.setState({
      options: options
    });
  };

  componentDidMount = () => {
      document.addEventListener("keydown", this.onEsc, false);
      document.getElementById('searchBoxInput').focus();
      if(this.props.searchLabels.len === 0) {
        this.props.refreshLabels();
      }
  }

  componentWillUnmount = () => {
    document.removeEventListener("keydown", this.onEsc, false);
    this.props.refreshLabels();
  }

  _onEsc = (event) => {

    if (document.activeElement.id !== "searchBoxInput") {
      return 0;
    }
    if (event.keyCode !== 27) {
      this.setState({numEscPressed:0});
    }
    if (event.keyCode === 27 && this.state.value === '' ) {
      console.log("esc pressed!");
      this.setState({numEscPressed:this.state.numEscPressed += 1});
      this.props.unsetMostRecentLabel();
    }
    if(event.keyCode === 27 && this.state.value === '' && this.state.numEscPressed>=2) {
      console.log("esc pressed2!")
      document.activeElement.blur();
    }
  }

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
      placeholder: "Search for a name or attribute!",
      value,
      onChange: this.onChange
    };
    var tagButtons = [];
    this.props.searchLabels.forEach(label => {
      tagButtons.push( <SearchButton key={label} unsetLabel={this.props.unsetLabel} label={label}/>);
    });

    const renderInputComponent = inputProps => {

      return(
        <div >
          <div className="embed-submit-field">

          <input {...inputProps} id="searchBoxInput"  onKeyPress={this._handleKeyPress} />
          <div id='results' />
          </div>
        </div>
        );
    };

    return (
      //Finding Tags


      <div id="searchBoxElem">
        {tagButtons}
        <div id="searchBox">

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

          />
        </div>
        <div id="results" />
      </div>
    );
  }

}
