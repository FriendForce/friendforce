import React, {Component} from 'react';
import MouseTrap from 'mousetrap';

export default class LabelButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      label:props.label
    }
  }

  _togglePrivate = () => {
    console.log("toggling privatcy for " + this.state.label);
  }

  componentDidMount = () => {
    MouseTrap.bind('p', this._togglePrivate);
  }

  componentWillUnmount = () => {
    MouseTrap.unbind('p', this._togglePrivate);

  }

  onClick = (label) => {
    this.props.setTag({label:label});
  }

  render() {
    return(
      <button class="mousetrap" onClick={() => this.onClick(this.state.label)} key={this.props.label} type="tag">{this.props.label}</button>
    );
  }
}
