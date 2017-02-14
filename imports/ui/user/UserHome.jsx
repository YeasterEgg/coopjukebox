import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { createContainer } from 'meteor/react-meteor-data'

import { LoggedUsers } from '../../api/loggedUsers.js'

import Waiter from '../common/Waiter.jsx'
import AuthButton from './atoms/AuthButton.jsx'
import PlaylistsIndex from './parts/PlaylistsIndex.jsx'

export default class UserHome extends Component {

  render(){
    if(!this.props.subscriptionsReady){
      return(<Waiter />)
    }else if(!this.props.user){
      return(<AuthButton />)
    }else{
      return(<PlaylistsIndex user={this.props.user} />)
    }
  }
}

UserHome.propTypes = {
  user: PropTypes.object,
}

export default createContainer(() => {

  sessionId = localStorage.sessionId
  const userSubscription = Meteor.subscribe('loggedUsers.fromSessionId', sessionId)

  return {
    user: LoggedUsers.findOne(),
    subscriptionsReady: userSubscription.ready()
  }
}, UserHome)
