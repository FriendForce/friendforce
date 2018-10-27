import React, { Component } from 'react';


export default class Overlay extends Component {


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
        <div key={key} className="overlay-text">
        {key} => {this.props.hotkeys[key].description}
        <br/>
        </div>
      )
    });
    return(
      <div>
      <div id="myNav" className="overlay">
        <div className="overlay-content">
          {hotKeyButtons}
        </div>
        <button className="closebtn" onClick={() => this.closeNav()}>&times;</button>
      </div>
      <button onClick={() => this.openNav()}>Show Hotkeys (or Command+K)</button>
      </div>
    );
  }

}
