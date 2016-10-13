import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

import TrackList from '../common/TrackList.jsx'

cf = require('../../lib/commonFunctions.js')
config = require('../../lib/config.js')
querystring = require('querystring')

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
        <label htmlFor="track_search">Search a Song</label>
        <input name="track_search" id="track_search" type="text" size="20" maxLength="50"/>
        <button type="submit">Search</button>
      </form>
    )
  }

  renderSearchResults(){
    if(this.state.searchResult.length > 0){
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
    if(this.props.clickOnTrackAction(track)){
      this.setState({searchResult: []})
    }else{
      console.log('Some error has occurred, sry amigo.')
    }
  }

  searchTrack(event){
    event.preventDefault()
    if(document.getElementById('track_search').value.length > 3){
      params = {
        q: document.getElementById('track_search').value,
        type: "track",
        limit: this.props.limit
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
}
