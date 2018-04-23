import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import {Link} from 'react-router-dom';

export default class Search extends Component {
  constructor() {
    super();
  }
  render() {
    return(
      <Container>
        <Link to={this.props.link}>
        <Row>
          <Col> Picture </Col> <Col>{this.props.person.name} </Col><Col>INFO</Col>
        </Row>
        </Link>
      </Container>
    );
  }
}