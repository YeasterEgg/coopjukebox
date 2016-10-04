import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import TrackSearch from './TrackSearch.jsx'
import Waiter from '../common/Waiter.jsx'
import TrackList from '../common/TrackList.jsx'

export default class Chooser extends Component {

  constructor(props){
    super(props)
    this.state = {
      searchResult: [],
      lastAddedTrack: false
    }
  }

  render(){
    return (
      <div className="songlist_creator--search_container">
        {this.renderLastAddedTrackNotice()}
        <form onSubmit={this.searchTrack.bind(this)} className="songlist_creator--search_form" >
          <input name="track_search" id="track_search" type="text" size="20" maxLength="50"/>
          <button type="submit">Search!</button>
        </form>
        <div className="songlist_creator--search_results">
          <TrackList tracks={this.state.searchResult} clickOnTrackAction={this.addTrackToSonglist.bind(this)} />
        </div>
      </div>
    )
  }

  renderLastAddedTrackNotice(){
    if(this.state.lastAddedTrack){
      return(
        <div className="songlist_creator--track_added_notice">
          {"Added " + this.state.lastAddedTrack.name}!
        </div>
      )
    }else{
      return null
    }
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
          this.setState({searchResult: searchResult})
        }
      }.bind(this)
      xhr.send(null)
    }
  }

  addTrackToSonglist(track){
    songlistId = this.props.songlist._id
    console.log(track)
    console.log(songlistId)
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

