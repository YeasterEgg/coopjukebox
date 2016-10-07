import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

import Waiter from '../common/Waiter.jsx'
import AuthButton from './AuthButton.jsx'
import PlaylistsManager from './PlaylistsManager.jsx'

export default class MasterController extends Component {

  constructor(props){
    super(props)
    this.state = {
      loaded: false,
      userId: false,
      playlists: [],
    }
  }

  componentWillMount(){
    Meteor.call("loggedUsers.fromSessionId", localStorage.sessionId, function(error, result){
      this.setState({userId: result.userId, loaded: true, playlists: result.playlists})
    }.bind(this))
  }

  render(){
    if(!this.state.loaded){
      return(<Waiter />)
    }else if(!this.state.userId){
      return(<AuthButton />)
    }else{
      return(<PlaylistsManager userId={this.state.userId} playlists={this.state.playlists}/>)
    }
  }
}
