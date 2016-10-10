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
      <form className="playlist_manager--add_playlist" onSubmit={this.importPlaylist.bind(this)} >
        <label htmlFor="playlist_id">Import playlist from ID or SpotifyUri</label>
        <input name="playlist_id" id="playlist_id" type="text" size="20" maxLength="70"/>
        <button type="submit">Import Playlist</button>
      </form>
    )
  }

  renderSearchForm(){
    return(
      <form onSubmit={this.searchTrack.bind(this)} className="playlist_manager--search_form" >
        <label htmlFor="track_search">Search a Song</label>
        <input name="track_search" id="track_search" type="text" size="20" maxLength="50"/>
        <button type="submit">Search</button>
      </form>
    )
  }

  renderSearchResults(){
    if(this.state.searchResult.length > 0){
      return(
        <div className="playlist_manager--search_results">
          <TrackList tracks={this.state.searchResult} clickOnTrackAction={this.addTrackToSonglist.bind(this)} withVotes={false}/>
        </div>
      )
    }else{
      return null
    }
  }

  importPlaylist(event){
    event.preventDefault()
    uri = document.getElementById('playlist_id').value.split(":")
    if(uri.length != 5) return false
    importedUserId = uri[2]
    importedPlaylistSpotifyId = uri[4]
    Meteor.call("playlist.importPlaylist", importedPlaylistSpotifyId, importedUserId, this.props.playlist, function(error, result){
      tracksNo = result.items.length
      this.props.setPositiveNotice("Imported " + tracksNo + " songs from playlist!")
      document.getElementById('playlist_id').value = ''
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
          this.setState({searchResult: tracks})
          document.getElementById('track_search').value = ''
        }
      }.bind(this)
      xhr.send(null)
    }
  }

  addTrackToSonglist(track){
    playlist = this.props.playlist
    Meteor.call("playlist.addTrackToSonglist", playlist, track, function(error, result){
      if(!error && result){
        this.setState({searchResult: []})
        this.props.setPositiveNotice("Added " + track.name + " to Songlist!")
      }
    }.bind(this))
  }
}

SpotifyTrackImporter.propTypes = {
  playlist: PropTypes.object.isRequired,
}
