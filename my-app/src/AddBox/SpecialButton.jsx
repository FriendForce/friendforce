import React, { Component } from 'react';

export default class SpecialButton extends Component {

  onClick = () => {
    this.props.unsetSpecial();
  }

  render() {
    return(
        <button onClick={this.onClick} key={this.props.special} type="special">{this.props.special}</button>
      );
  }

}
