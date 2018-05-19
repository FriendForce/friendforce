import React, {Component} from 'react';
import { Container, Row } from 'reactstrap';
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
            <button onClick={()=>{DataStore.firebasePush(this.props.userId)}}>TEST PIUSH </button>
            <button onClick={()=>{DataStore.registerFirebaseListener(this.props.userId, ()=>{this.props.updateData();})}
                               }>TEST PULL </button>
            <button onClick={()=>{DataStore.resetData()
                                  .then(()=>{this.props.updateData();});
                                }}>
                                  RESET LOCAL DATA</button>
          </Container>
          <Container>
            NumPersonDiffs = {DataStore.numPersonDiffs()}
            NumTagDiffs = {DataStore.numTagDiffs()}
          </Container>
          <Container>
          <button onClick={()=>{DataStore.processTags()}}>PROCESS TAGS </button>
          </Container>
          <Container>
          <button onClick={()=>{DataStore.firebasePushLabels()}}>PUSH LABELS </button>
          </Container>
          </Row>
        </div> 
    );
  }
}