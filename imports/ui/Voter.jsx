import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'
import TrackList from './TrackList.jsx'

export default class Voter extends Component {

  // State set

  constructor(props){
    super(props)
    this.state = {
      trackList: [],
      pollValid: false
    }
  }

  // Rendering Methods

  render(){
    Meteor.call("userFromPollId", this.props.params.pollId, function(error, result){
      console.log(error)
      console.log(result)
    })
    console.log(this.props)
    if(this.state.pollValid){
      return(<div>{this.renderPage()}</div>)
    }else{
      return(<div>{this.renderWaiter()}</div>)
    }
  }

  renderWaiter(){
    return(
      <div className="loader--container">
        <div className="loader--dots">
          {"{"}<span>.</span><span>.</span><span>.</span>{"}"}
        </div>
      </div>
    )
  }

  renderPage(){
    return (
      <div className="home--search_form">
        <input name="track_search" id="track_search" type="text" size="20" maxLength="50" onChange={this.searchTrack.bind(this)}/>
        <button type="submit">Search for this Track!</button>
        <div className="home--search_results">
          {this.renderTrackList(this.state.tracklist)}
        </div>
      </div>
    )
  }

  renderTrackList(trackList){
    return (
      <TrackList tracks={this.state.trackList} addTrack={this.addTrack.bind(this)} />
    )
  }

  searchTrack(){
    params = {
      q: document.getElementById('track_search').value,
      type: "track"
    }
    url = "https://api.spotify.com/v1/search?" + querystring.stringify(params)
    xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onload = function (event){
      if (xhr.readyState === 4 && xhr.status === 200) {
        trackList = JSON.parse(xhr.responseText).tracks.items
        this.setState({trackList: trackList})
      }
    }.bind(this)
    xhr.send(null)
  }

  addTrack(track){
    userId = this.props.playlist.userSpotifyId
    playlistId = this.props.playlist.playlistSpotifyId
    url = "https://api.spotify.com/v1/users/" + userId + "/playlists/" + playlistId + "/tracks"
    trackUri = track.uri
    token = this.props.playlist
    options = {
      uris: [track.uri]
    }
    Meteor.call("addTrackToPlaylist", url, token, options, userId, function(result){
    })
  }
}
