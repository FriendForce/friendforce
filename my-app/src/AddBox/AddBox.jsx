import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import MouseTrap from 'mousetrap';
import SpecialButton from './SpecialButton';


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
};

const getSuggestions = (value, options) => {
  const escapedValue = escapeRegexCharacters(value.trim());
  if (escapedValue === '') {
    return [];
  }
  const regex = new RegExp(escapedValue, 'i');
  var suggestions = options.filter(tag_or_person => regex.test(getSuggestionValue(tag_or_person))).sort();
  return suggestions
};


const renderSuggestion = (suggestion, {query}) => {
  var img = 'none';
  if (suggestion.hasOwnProperty('label')) {
    img = 'TAG';
  } else if (suggestion.hasOwnProperty('name')) {
    img = 'PERSON';
  } else if (typeof(suggestion) === "string") {
    img =  'TAG';
  }
  return(
         //TODO: how do you get theme classes in?
    <span className='sugestionContent'>{getSuggestionValue(suggestion) + ' ' + img}</span>
    );
};


export default class AddBox extends Component {
  constructor(props) {
    super();

    var options = props.labels;
    this.state = {
      value: '',
      suggestions: [],
      options: options,
      numEscPressed: 0,
    }

    this.onEsc = this._onEsc.bind(this);
    this.reset = this.reset.bind(this);
  }

  componentWillReceiveProps = new_props => {
    // Update lists of things when props change
    var options = new_props.labels;
    var publicity = new_props.publicity;
    this.setState({
      options: options
    });
  };

  componentDidMount = () => {
      document.addEventListener("keydown", this.onEsc, false);
  }

  componentWillUnmount = () => {
    document.removeEventListener("keydown", this.onEsc, false);
  }

  onChange = (event, { newValue, method }) => {
    this.setState({
      value: newValue
    });
  };

  _onEsc = (event) => {
    if (document.activeElement.id !== "addBoxInput") {
      return 0;
    }
    if (event.keyCode !== 27) {
      this.setState({numEscPressed:0});
    }
    if (event.keyCode === 27 && this.state.value === '' ) {
      this.setState({numEscPressed:this.state.numEscPressed += 1});
      this.props.unsetSpecial();
    }
    if(event.keyCode === 27 && this.state.value === '' && this.state.numEscPressed>=2) {
      document.activeElement.blur();
    }
  }

  onSuggestionsFetchRequested = ({ value, reason }) => {
    this.setState({
      suggestions: getSuggestions(value, this.state.options)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  reset = () => {
    this.props.unsetSpecial();
    this.setState({value:''});
  }

  handleTagSelection = (tag) => {
    this.props.addTagToPerson(this.props.specialLabel+":"+tag.label, this.props.publicity);
    this.props.unsetSpecial();
  }

   handleLabelSelection = (label) => {
    if (label.split(":").length > 1) {
      this.props.setSpecial(label.split(":")[0]);
    } else {
      this.props.addTagToPerson(this.props.specialLabel+":"+label, this.props.publicity);
      this.props.unsetSpecial();
    }
  }


  onSuggestionSelected = (event, { suggestion }) => {
    /**
     *Handle existing selection
    */
    // determine whether suggestion is a person or a tag
      // handle selected tag
    this.handleLabelSelection(suggestion);
    this.setState({value:''});
  };

   _handleKeyPress = e => {
    if (this.state.suggestions.length === 0 && this.state.value !== '') {
          // Handles comlete entries
      if (e.key === 'Enter') {
        if(this.state.value[this.state.value.length - 1] === ":") {
          var split = this.state.value.split(":")
          var value = '';
          if (split.length > 1) {
            value = split[1];
          }
          this.props.setSpecial(split[0]);
          this.setState({value:value});
        } else {
          this.props.addTagToPerson(this.props.specialLabel+":"+this.state.value, this.props.publicity);
          this.setState({value:''});
          this.props.unsetSpecial();
        }
      }
    }
  };





  render() {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: "Add Tags!",
      value,
      onChange: this.onChange
    };

    const renderInputComponent = inputProps => {
      var specialButtons = [];
      if(this.props.specialLabel) {
        specialButtons.push(<SpecialButton key={this.props.specialLabel}
                                           unsetSpecial={this.props.unsetSpecial}
                                          special={this.props.specialLabel + ":"}/>);
      }
      return(
        <div className="autosuggest__box">
          <div className="embed-submit-field">
          <div className="autosuggest__buttons">{specialButtons}</div>
          <div className="autosuggest__input-box">
          <input {...inputProps} id="addBoxInput"  onKeyPress={this._handleKeyPress} />
          </div>
          <div id='results' />
          </div>
        </div>
        );
    };

    return (
      //Finding Tags
      <div id="addBoxElem" >
        <div id="addBox" class="add-box">

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

        <div className="form-check">
          <input checked={this.props.publicity==="private"} onChange={this.props.onPublicityChanged}  type="checkbox" className="form-check-input" id="exampleCheck1"/>
          <label className="form-check-label" htmlFor="exampleCheck1">Make Tag Private</label>
        </div>
        <div id="results" />
      </div>
    );
  }

}
