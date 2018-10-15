import React, { Component } from 'react';
import MouseTrap from 'mousetrap';


export default class Overlay extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount = () => {
    MouseTrap.bind('esc', this.closeNav);
  }
  componentWillUnmount = () => {
    MouseTrap.unbind('esc', this.closeNav);
  }


      /* Open */
    openNav = () => {
      console.log("opennave");
        document.getElementById("myNav").style.display = "block";
    }

    /* Close */
    closeNav = () => {
        console.log("closenav");
        document.getElementById("myNav").style.display = "none";
    }

  render() {
    var hotKeyButtons = [];
    Object.keys(this.props.hotkeys).forEach((key) => {
      hotKeyButtons.push(
        <a href='#'>{key} : {this.props.hotkeys[key].description} </a>
      )
    });
    return(
      <div>
      <div id="myNav" class="overlay">

      <a href="javascript:void(0)" class="closebtn" onClick={() => this.closeNav()}>&times;</a>

        <div class="overlay-content">
          {hotKeyButtons}
        </div>
      </div>

      <button onClick={() => this.openNav()}>Show Hotkeys (or Command+K)</button>
      </div>
    );
  }

}
