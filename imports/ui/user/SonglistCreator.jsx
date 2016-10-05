import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'

import Waiter from '../common/Waiter.jsx'
import TrackSearch from './TrackSearch.jsx'
import Chooser from './Chooser.jsx'
import { LoggedUsers } from '../../api/loggedUsers.js'
import { Songlists } from '../../api/songlists.js'

querystring = require('querystring')
const crypto = require('crypto')

export default class SonglistCreator extends Component {

  constructor(props){
    super(props)
    this.state = {
      userId: false,
      songlist: false,
    }
  }

  componentWillMount(){
    Meteor.call("loggedUsers.fromSessionId", localStorage.sessionId, function(error, loggedUserResult){
      if(loggedUserResult.logged){
        this.setState({userId: loggedUserResult.userId})
        if(loggedUserResult.songlistRndmId){
          console.log(loggedUserResult)
          Meteor.subscribe("songlistFromSonglistRndmId", loggedUserResult.songlistRndmId,{
            onReady: function(){
              console.log(Songlists.find().fetch())
              this.setState({songlist: Songlists.find().fetch()[0]})
            }.bind(this)
          })
        }
      }
    }.bind(this))
  }

  render(){
    if(!this.props.subscription){
      return(<Waiter />)
    }else{
      return(<div className="songlist_creator--container">{this.renderPage()}</div>)
    }
  }

  renderPage(){
    if(!this.state.userId){
      return (
        <button className="pure-button pure-button-primary songlist_creator--auth_button" onClick={this.getAuth.bind(this)}>Access through Spotify</button>
      )
    }else{
      return (
        <div>{this.renderCreateSonglist()}</div>
      )
    }
  }

  renderCreateSonglist(){
    if(!this.state.songlist){
      return(
        <form className="songlist_creator--songlist_form" onSubmit={this.createPlaylist.bind(this)} >
          <div className="songlist_creator--form_part">
            <label for="playlist_name">Playlist Name</label>
            <input name="playlist_name" id="playlist_name" type="text" size="20" maxLength="50" />
          </div>
          <div className="songlist_creator--form_part">
            <label for="playlist_length">Number of Songs</label>
            <input name="playlist_length" id="playlist_length" type="number" size="20" maxLength="50" />
          </div>
          <div className="songlist_creator--form_part">
            <label for="playlist_duration">Duration of polls</label>
            <input name="playlist_duration" id="playlist_length" type="number" size="20" maxLength="50" />
          </div>
          <button type="submit">Create playlist</button>
        </form>
      )
    }else{
      return(
        <Chooser songlist={this.state.songlist} />
      )
    }
  }

  getAuth(){
    sessionId = crypto.randomBytes(64).toString('base64')
    localStorage.setItem("sessionId", sessionId)
    Meteor.call('getAuthUrl', sessionId, function(error, spotifyAuthUrl){
      window.location.replace(spotifyAuthUrl)
    })
  }

  createPlaylist(event){
    event.preventDefault()
    options =  {
      "name": document.getElementById("playlist_name").value,
      "length": document.getElementById("playlist_length").value,
      "public": true
    }
    Meteor.call("createPlaylist", options, this.state.userId, function(error, result){
      if(!error){
        this.setState({songlist: result})
      }
    }.bind(this))
  }

  addTrackToSonglist(track){
    songlistId = this.state.songlistId
    Meteor.call("addTrackToSonglist", songlistId, track, function(error, result){
      if(!error){
        return result
      }
    })
  }
}

SonglistCreator.propTypes = {
  subscription: PropTypes.bool.isRequired,
  users: PropTypes.array.isRequired,
}

export default createContainer(() => {
  const usersSubscription = Meteor.subscribe('loggedUsers')

  return {
    users: LoggedUsers.find().fetch(),
    subscription: usersSubscription.ready()
  }
}, SonglistCreator)
