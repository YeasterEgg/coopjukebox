import React, { Component, PropTypes } from 'react'
import { render } from 'react-dom'
import { browserHistory, Router, Route, Link } from 'react-router'
import Voter from './Voter.jsx'
import Pollifier from './Pollifier.jsx'

export default class PollRouter extends Component {
  render(){
    return(
      <Router history={browserHistory}>
        <Route path="/" component={Pollifier} />
        <Route path="/pl/:pollId" component={Voter} />
      </Router>
    )
  }
}
