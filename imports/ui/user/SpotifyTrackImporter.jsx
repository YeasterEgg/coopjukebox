import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { createContainer } from 'meteor/react-meteor-data'

import TrackList from '../common/TrackList.jsx'
import { Polls } from '../../api/polls.js'

cf = require('../../lib/commonFunctions.js')
config = require('../../lib/config.js')
querystring = require('querystring')

export default class SpotifyTrackImporter extends Component {

  constructor(props){
    super(props)
    this.state = {
      searchResult: [],
    }
  }

  render(){
    return (
      <div>
        {this.renderImportPlaylistButton()}
        {this.renderSearchForm()}
        {this.renderSearchResults()}
      </div>
    )
  }

  renderImportPlaylistButton(){
    return(
      <form className="songlist_creator--add_playlist" onSubmit={this.importPlaylist.bind(this)} >
        <label htmlFor="playlist_id">Import playlist from ID or SpotifyUri</label>
        <input name="playlist_id" id="playlist_id" type="text" size="20" maxLength="70"/>
        <button type="submit">Import Playlist</button>
      </form>
    )
  }

  renderSearchForm(){
    return(
      <form onSubmit={this.searchTrack.bind(this)} className="songlist_creator--search_form" >
        <label htmlFor="track_search">Search a Song</label>
        <input name="track_search" id="track_search" type="text" size="20" maxLength="50"/>
        <button type="submit">Search</button>
      </form>
    )
  }

  renderSearchResults(){
    if(this.state.searchResult.length > 0){
      return(
        <div className="songlist_creator--search_results">
          <TrackList tracks={this.state.searchResult} clickOnTrackAction={this.addTrackToSonglist.bind(this)} withVotes={false}/>
        </div>
      )
    }else{
      return null
    }
  }

  importPlaylist(event){
    event.preventDefault()
    songlistRndmId = this.props.songlist.songlistRndmId
    playlistSpotifyId = document.getElementById('playlist_id').value.split(":").slice(-1)[0]
    Meteor.call("importPlaylist", playlistSpotifyId, songlistRndmId, function(error, result){
      tracksNo = result.items.length
      this.props.setPositiveNotice("Imported " + tracksNo + " songs from playlist!")
    }.bind(this))
  }

  searchTrack(event){
    event.preventDefault()
    if(document.getElementById('track_search').value.length > 3){
      params = {
        q: document.getElementById('track_search').value,
        type: "track"
      }
      url = config.searchUrl + querystring.stringify(params)
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
    songlistRndmId = this.props.songlist.songlistRndmId
    this.setState({searchResult: []})
    Meteor.call("addTrackToSonglist", songlistRndmId, track, function(error, result){
      if(!error && result){
        this.setState({searchResult: []})
        this.props.setPositiveNotice("Added " + track.name + " to Songlist!")
      }
    }.bind(this))
  }

}

SpotifyTrackImporter.propTypes = {
  songlist: PropTypes.object.isRequired,
}
