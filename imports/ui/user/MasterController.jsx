import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { createContainer } from 'meteor/react-meteor-data'

import { LoggedUsers } from '../../api/loggedUsers.js'

import Waiter from '../common/Waiter.jsx'
import AuthButton from './AuthButton.jsx'
import PlaylistsManager from './PlaylistsManager.jsx'

export default class MasterController extends Component {

  render(){
    if(!this.props.subscriptionsReady){
      return(<Waiter />)
    }else if(!this.props.user){
      return(<AuthButton />)
    }else{
      return(<PlaylistsManager user={this.props.user} />)
    }
  }
}

MasterController.propTypes = {
  user: PropTypes.object,
}

export default createContainer(() => {

  sessionId = localStorage.sessionId
  const userSubscription = Meteor.subscribe('loggedUsers.fromSessionId', sessionId)

  return {
    user: LoggedUsers.findOne(),
    subscriptionsReady: userSubscription.ready()
  }
}, MasterController)
