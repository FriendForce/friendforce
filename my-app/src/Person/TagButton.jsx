import React, {Component} from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

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

  handleClick = (e, data) => {
    console.log(data.action);
  }

  render() {
    return(
           <div>
      
      <ContextMenuTrigger id={this.props.tag.label}>
        <button onClick={() => this.onClick(this.state.tag)} key={this.props.tag.label} type="tag">{this.props.tag.label}</button>
      </ContextMenuTrigger>

       <ContextMenu id={this.props.tag.label}>
          <MenuItem data={{action: 'makeprivate'}} onClick={this.handleClick}>
          Make Private
        </MenuItem>
        <MenuItem data={{action: 'delete'}} onClick={this.handleClick}>
          Delete
        </MenuItem>
        <MenuItem divider />
        <MenuItem data={{action: 'modify'}} onClick={this.handleClick}>
          Modify
        </MenuItem>
      </ContextMenu>
      </div>
    );
  }
}