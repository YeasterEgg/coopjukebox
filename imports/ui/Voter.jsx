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
      pollId: false
    }
  }

  // Rendering Methods

  render(){
    if(this.state.pollId){
      return(<div className="homepage--father_container">{this.renderPage()}</div>)
    }else{
      return(<div className="homepage--father_container">{this.renderWaiter()}</div>)
    }
  }

  componentWillMount(){
    pollId = this.props.params.pollId
    Meteor.call("userFromPollId", pollId, function(error, result){
      if(!error){
        this.setState({pollId: pollId})
      }
    }.bind(this))
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
          trackList = JSON.parse(xhr.responseText).tracks.items
          this.setState({trackList: trackList})
        }
      }.bind(this)
      xhr.send(null)
    }
  }

  addTrack(track){
    pollId = this.state.pollId
    trackUri = track.uri
    console.log(pollId)
    console.log(trackUri)
    Meteor.call("addTrackToPlaylist", pollId, trackUri, function(result){
      console.log(result)
    })
  }
}
