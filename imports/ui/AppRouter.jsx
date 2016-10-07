import React, { Component, PropTypes } from 'react'
import { render } from 'react-dom'
import { browserHistory, Router, Route, Link } from 'react-router'

import Voter from './people/Voter.jsx'

import MasterController from './user/MasterController.jsx'
import Callback from './user/Callback.jsx'

import PageNotFound from './common/PageNotFound.jsx'

export default class AppRouter extends Component {
  render(){
    return(
      <Router history={browserHistory}>
        <Route path="/" component={MasterController} />
        <Route path="/callback" component={Callback} />
        <Route path="/:playlistLocalName" component={Voter} />
        <Route path="/404" component={PageNotFound} />
      </Router>
    )
  }
}
