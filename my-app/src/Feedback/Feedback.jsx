import React, { Component } from 'react';
import MouseTrap from 'mousetrap';

export default class Feedback extends Component {


      /* Open */
    openNav = () => {
        document.getElementById("feedback").style.display = "block";
    }

    /* Close */
    closeNav = () => {
        document.getElementById("feedbackForm").value=""
        document.getElementById("feedback").style.display = "none";
    }


    onKeyPress = (event) => {
      if (event.keyCode === 27) {
        this.closeNav();
      }
      if (event.keyCode == 13 && event.metaKey) {
        this.submit();
      }
    }

    submit = () => {
      console.log('submit ' + document.getElementById("feedbackForm").value);
      this.props.submitFeedback(document.getElementById("feedbackForm").value);
      this.closeNav();
    }

  render() {
    return(
      <div id="feedback" className="feedback">
      <button className="closebtn" onClick={() => this.closeNav()}>&times;</button>

    <div className="form-group">
      <label >Give us Any Input You Have! Press Command + Enter to Submit.</label>
      <textarea className="form-control" id="feedbackForm" rows="3" onKeyDown={this.onKeyPress.bind(this)}></textarea>
    </div>
      <button className="btn btn-primary" onClick={this.submit.bind(this)}>Submit</button>
      </div>
    );
  }

}
