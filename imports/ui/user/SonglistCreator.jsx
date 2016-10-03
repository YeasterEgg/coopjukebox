import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'

import Waiter from '../common/Waiter.jsx'
import TrackSearch from './TrackSearch.jsx'
import { LoggedUsers } from '../api/loggedUsers.js'

querystring = require('querystring')
const crypto = require('crypto')

export default class SonglistCreator extends Component {

  constructor(props){
    super(props)
    this.state = {
      userId: false,
      playlist: false,
      songlist: false
    }
  }

  componentWillMount(){
    Meteor.call("loggedUsers.fromSessionId", localStorage.sessionId, function(error, result){
      if(result.logged){
        this.setState({userId: result.user._id})
        if(result.user.playlistSpotifyId){
          Meteor.subscribe("songlistFromSonglistId", result.user.songlistId, function(error, result){
            console.log(error)
            console.log(result)
            // this.setState({songlist: result[0]})
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
    if(!this.state.user){
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
    if(!this.state.playlistPresent){
      return(
        <form className="songlist_creator--songlist_form" onSubmit={this.createPlaylist.bind(this)} >
          <input name="playlist_name" id="playlist_name" type="text" size="20" maxLength="50" />
          <input name="playlist_length" id="playlist_length" type="number" size="20" maxLength="50" />
          <button type="submit">Crea playlist</button>
        </form>
      )
    }else{
      return(
        <Chooser songlist={this.state.songlist} />
      )
    }
  }

  // renderCreateSonglistLink(){
  //   pollUrl = "http://localhost:3000/pl/" + this.state.currentUser.pollId
  //   return(
  //     <div className="homepage--poll_url">
  //       <div className="homepage--poll_label">Use the following url:</div>
  //       <a className="homepage--poll_id" href={pollUrl}>{pollUrl}</a>
  //     </div>
  //   )
  // }

  getAuth(){
    sessionId = crypto.randomBytes(64).toString('base64')
    localStorage.setItem("sessionId", sessionId)
    Meteor.call('getAuthUrl', sessionId, function(error, spotifyAuthUrl){
      if(!error){
        window.location.replace(spotifyAuthUrl)
      }else{
        console.log(error)
      }
    })
  }

  createPlaylist(){
    options =  {
      "name": document.getElementById("playlist_name").value,
      "length": document.getElementById("playlist_length").value,
      "public": true
    }
    Meteor.call("createPlaylist", options, this.state.userId, function(error, result){
      console.log(error)
      console.log(result)
      if(!error){
        this.setState({playlistPresent: true})
      }
    }.bind(this))

    url = "https://api.spotify.com/v1/users/" + userSpotifyId + "/playlists"
    token = this.state.currentUser.token.accessToken
    userId = this.state.currentUser._id
  }

  searchTrack(){
    if(document.getElementById('track_search').value.length > 3){
      params = {
        q: document.getElementById('track_search').value,
        type: "track"
      }
      url = "https://api.spotify.com/v1/search?" + querystring.stringify(params)
      xhr = new XMLHttpRequest()
      xhr.open('GET', url, true)
      xhr.onload = function (event){
        if (xhr.readyState === 4 && xhr.status === 200) {
          trackSearch = JSON.parse(xhr.responseText).tracks.items
          this.setState({trackSearch: trackSearch})
        }
      }.bind(this)
      xhr.send(null)
    }
  }
  addTrackToPoll(track){
    pollId = this.state.pollId
    Meteor.call("addTrackToPoll", pollId, track, function(error, result){
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
