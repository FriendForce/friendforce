import React, {Component} from 'react';

export default class TagButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tag:props.tag
    }
  }
  
  onClick = (tag) => {
    this.props.setTag(tag);
  }

  render() {
    return(
      <button onClick={() => this.onClick(this.state.tag)} key={this.props.tag.label} type="tag">{this.props.tag.label}</button>
    );
  }
}