import React, {Component} from 'react';

export default class LabelButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      label:props.label
    }
  }
  
  onClick = (label) => {
    this.props.setTag({label:label});
  }

  render() {
    return(
      <button onClick={() => this.onClick(this.state.label)} key={this.props.label} type="tag">{this.props.label}</button>
    );
  }
}