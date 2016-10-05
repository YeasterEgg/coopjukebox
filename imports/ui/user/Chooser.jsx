import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import TrackSearch from './TrackSearch.jsx'
import Waiter from '../common/Waiter.jsx'
import TrackList from '../common/TrackList.jsx'
const ReactCSSTransitionGroup = require('react-addons-css-transition-group');
cf = require('../../lib/commonFunctions.js')

export default class Chooser extends Component {

  constructor(props){
    super(props)
    this.state = {
      searchResult: [],
      lastAddedTrack: false,
      pollStarted: this.props.songlist.startedAt
    }
  }

  render(){
    return (
      <div>
        <ReactCSSTransitionGroup transitionName="fadeInFadeOut" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
          {this.renderLastAddedTrackNotice()}
        </ReactCSSTransitionGroup>
        {this.renderStartedAt()}
        <div className="songlist_creator--playlist_link">
          <a href={"http://localhost:3000/sl/" + this.props.songlist.songlistRndmId}> {"http://localhost:3000/" + this.props.songlist.songlistRndmId} </a>
        </div>
        <div className="songlist_creator--search_container">
          <form onSubmit={this.searchTrack.bind(this)} className="songlist_creator--search_form" >
            <input name="track_search" id="track_search" type="text" size="20" maxLength="50"/>
            <button type="submit">Search!</button>
          </form>
          <div className="songlist_creator--search_results">
            {this.renderTracklistComponent()}
          </div>
        </div>
        {this.renderStartButton()}
        {this.renderImportPlaylistButton()}
      </div>
    )
  }

  renderTracklistComponent(){
    if(this.state.searchResult.length > 0){
      tracklistComponent = <TrackList tracks={this.state.searchResult} clickOnTrackAction={this.addTrackToSonglist.bind(this)} />
    }else{
      tracklistComponent = null
    }
    return(
      <ReactCSSTransitionGroup transitionName="fadeInFadeOut" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
        {tracklistComponent}
      </ReactCSSTransitionGroup>
    )
  }

  renderLastAddedTrackNotice(){
    if(this.state.lastAddedTrack){
      setTimeout(function(){
        this.setState({lastAddedTrack: false})
      }.bind(this), 3000)
      return(
        <div className="songlist_creator--track_added_notice button-success">
          {"Added " + this.state.lastAddedTrack.name}!
        </div>
      )
    }else{
      return null
    }
  }

  renderStartButton(){
    return(
      <button type="submit" onClick={this.startVoting.bind(this)}>Start Voting!</button>
    )
  }

  renderImportPlaylistButton(){
    return(
      <form className="songlist_creator--add_playlist" onSubmit={this.importPlaylist.bind(this)} >
        <label htmlFor="playlist_id">Import playlist from ID od SpotifyUri</label>
        <input name="playlist_id" id="playlist_id" type="text" size="20" maxLength="70"/>
        <button type="submit">Import Playlist!</button>
      </form>
    )
  }

  renderStartedAt(){
    if(this.state.pollStarted){
      return(
        <div className="songlist_creator--playlist_start">
          <span>{this.props.songlist.startedAt.toLocaleString()}</span>
        </div>
      )
    }
  }

  startVoting(){
    songlistId = this.props.songlist._id
    Meteor.call("startSonglistPoll", songlistId, function(error, result){
      if(result){
        console.log(result)
        this.setState({pollStarted: result})
      }
    })
  }

  importPlaylist(event){
    event.preventDefault()
    songlistRndmId = this.props.songlist.songlistRndmId
    playlistSpotifyId = document.getElementById('playlist_id').value.split(":").slice(-1)[0]
    Meteor.call("importPlaylist", playlistSpotifyId, songlistRndmId, function(error, result){
      if(!error){
        console.log(result)
      }
    })
  }

  searchTrack(event){
    event.preventDefault()
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
          searchResult = JSON.parse(xhr.responseText).tracks.items
          tracks = _.map(searchResult, function(track){
            return cf.getTrackValues(track)
          })
          console.log(tracks)
          this.setState({searchResult: tracks})
        }
      }.bind(this)
      xhr.send(null)
    }
  }

  addTrackToSonglist(track){
    songlistId = this.props.songlist._id
    this.setState({searchResult: [], lastAddedTrack: track})
    Meteor.call("addTrackToSonglist", songlistId, track, function(error, result){
      if(!error && result){
        this.setState({searchResult: [], lastAddedTrack: track})
      }
    }.bind(this))
  }

}

Chooser.propTypes = {
  songlist: PropTypes.object.isRequired,
}

