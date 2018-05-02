import React, {Component} from 'react';
import { Container, Row, Col } from 'reactstrap';
import DataStore from './DataStore.jsx';

export default class TestStuff extends Component {
  render () {
    return (
      <div className="test-stuff" id="experimenal Stuff">
        <Row>
          <Container>
            <header> Test Stuff </header>
          </Container>
          <Container>
            User = {this.props.userId}
          </Container>
          <Container>
            <input id='userTest' onKeyPress= {
              e => {
                if (e.key === 'Enter') {
                  this.props.setUser(document.getElementById("userTest").value);
                  document.getElementById("userTest").value = "";
                }
              }} />
          </Container>
          <Container>
            <button onClick={()=>{DataStore.firebasePush(this.state.userId)}}>TEST PIUSH </button>
            <button onClick={()=>{DataStore.firebasePull(this.state.userId)
                              .then(()=>{this.updateData();});
                               }}>TEST PULL </button>
          </Container>
          <Container>
            NumPersonDiffs = {DataStore.numPersonDiffs()}
            NumTagDiffs = {DataStore.numTagDiffs()}
          </Container>
          </Row>
        </div> 
    );
  }
}