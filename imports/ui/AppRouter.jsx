import React, { Component, PropTypes } from 'react'
import { render } from 'react-dom'
import { browserHistory, Router, Route, Link } from 'react-router'

import Voter from './people/Voter.jsx'

import SonglistCreator from './user/SonglistCreator.jsx'
import Callback from './user/Callback.jsx'

import PageNotFound from './common/PageNotFound.jsx'

export default class AppRouter extends Component {
  render(){
    return(
      <Router history={browserHistory}>
        <Route path="/" component={SonglistCreator} />
        <Route path="/pl/:pollId" component={Voter} />
        <Route path="/callback" component={Callback} />
        <Route path="/*" component={PageNotFound} />
      </Router>
    )
  }
}
