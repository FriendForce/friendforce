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
    if (data.action === 'makeprivate') {
      this.props.updateTag(this.props.tag.id, {'publicity':'private'});
    }
    if (data.action === 'makepublic') {
      this.props.updateTag(this.props.tag.id, {'publicity':'public'});
    }
    if (data.action === 'delete') {
      console.log("trying to delete " + this.props.tag.id);
      this.props.deleteTag(this.props.tag.id);
    }
  }

  render() {

    var className = "tagbutton-public";
    if (this.props.tag.publicity === 'private') {
      className = 'tagbutton-private';
    }
    return(
           <div>

      <ContextMenuTrigger id={this.props.tag.id}>
        <button className={className} onClick={() => this.onClick(this.props.tag)} key={this.props.tag.label} type="tag">{this.props.tag.label}</button>
      </ContextMenuTrigger>

       <ContextMenu id={this.props.tag.id}>
          {this.props.tag.publicity === 'public'?
          <MenuItem data={{action: 'makeprivate'}} onClick={this.handleClick}>
            Make Private
          </MenuItem>
          :
          <MenuItem data={{action: 'makepublic'}} onClick={this.handleClick}>
            Make Public
          </MenuItem>
        }
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
