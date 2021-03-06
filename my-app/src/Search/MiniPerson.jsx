import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import {Link} from 'react-router-dom';

export default class Search extends Component {
  
  render() {
    return(
      <Container>
        
        <Row className="miniperson-row">
          <Link to={this.props.link} className="miniperson-link">
          <div className="miniperson-box">
          <Col> <span className="miniperson-picture"></span> </Col> <Col>{this.props.person.name} </Col><Col>INFO</Col>
          </div>
           </Link>
        </Row>
       
      </Container>
    );
  }
}