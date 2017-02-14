import React, { Component, PropTypes } from 'react'
import { render } from 'react-dom'
import { browserHistory, Router, Route, Link } from 'react-router'

import MasterVoter from './people/MasterVoter.jsx'
import UserHome from './user/UserHome.jsx'
import Callback from './user/Callback.jsx'
import PageNotFound from './common/PageNotFound.jsx'

export default class AppRouter extends Component {
  render(){
    return(
      <Router history={browserHistory}>
        <Route path="/" component={UserHome} />
        <Route path="/callback" component={Callback} />
        <Route path="/:chosenName" component={MasterVoter} />
        <Route path="/404" component={PageNotFound} />
      </Router>
    )
  }
}
