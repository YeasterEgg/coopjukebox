import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

import TrackList from '../common/TrackList.jsx'

export default class TrackSearcher extends Component {

  constructor(props){
    super(props)
    this.state = {
      searchResult: [],
    }
  }

  render(){
    return (
      <div className="track_searcher--container">
        {this.renderSearchForm()}
        {this.renderSearchResults()}
      </div>
    )
  }

  renderSearchForm(){
    return(
      <form onSubmit={this.searchTrack.bind(this)} className="track_searcher--search_form" >
        <label htmlFor="track_search">
          Search a Song
          <input name="track_search" id="track_search" type="text" size="20" maxLength="50"/>
        </label>
        <button type="submit">Search</button>
      </form>
    )
  }

  renderSearchResults(){
    if(this.state.searchResult && this.state.searchResult.length > 0){
      return(
        <div className="track_searcher--search_results">
          <TrackList tracks={this.state.searchResult} clickOnTrackAction={this.clickOnTrackAndClear.bind(this)} withVotes={false}/>
        </div>
      )
    }else{
      return null
    }
  }

  clickOnTrackAndClear(track){
    this.props.clickOnTrackAction(track)
    this.setState({searchResult: []})
  }

  searchTrack(event){
    event.preventDefault()
    if(document.getElementById('track_search').value.length > 3){
      query = document.getElementById('track_search').value
      Meteor.call("track.searchTracks", query, this.props.limit, function(error, result){
        this.setState({searchResult: result})
      }.bind(this))
    }
  }
}
