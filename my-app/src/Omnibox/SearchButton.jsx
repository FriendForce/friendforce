import React, { Component } from 'react';

export default class SearchButton extends Component {

  onClick = () => {
    this.props.unsetLabel(this.props.label);
  }

  render() {
    return(
        <button onClick={this.onClick} key={this.props.label} type="tag">{this.props.label}</button>
      );
  }
  
}