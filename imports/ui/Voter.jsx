import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'
import TrackSearch from './TrackSearch.jsx'
import TrackList from './TrackList.jsx'

export default class Voter extends Component {

  // State set

  constructor(props){
    super(props)
    this.state = {
      pollId: false,
      trackSearch: []
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
      <div>
        <div className="home--search_form">
          <input name="track_search" id="track_search" type="text" size="20" maxLength="50" onChange={this.searchTrack.bind(this)}/>
          <div className="home--search_results">
            {this.renderTrackSearch(this.state.trackSearch)}
          </div>
        </div>
        <div className="home--track_list">
          {this.renderTrackList(this.props.trackList)}
        </div>
      </div>
    )
  }

  renderTrackList(){
    return(
      <TrackList pollId={this.state.pollId} addVoteToTrack={this.addVoteToTrack.bind(this)}/>
    )
  }

  renderTrackSearch(trackSearch){
    return (
      <TrackSearch tracks={this.state.trackSearch} addTrackToPoll={this.addTrackToPoll.bind(this)} />
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
          trackSearch = JSON.parse(xhr.responseText).tracks.items
          this.setState({trackSearch: trackSearch})
        }
      }.bind(this)
      xhr.send(null)
    }
  }

  addTrack(track){
    pollId = this.state.pollId
    trackUri = track.uri
    Meteor.call("addTrackToPlaylist", pollId, trackUri, function(result){
    })
  }

  addTrackToPoll(track){
    pollId = this.state.pollId
    Meteor.call("addTrackToPoll", pollId, track, function(error, result){
      if(!error){
        return result
      }
    })
  }

  addVoteToTrack(track){
    Meteor.call("addVoteToTrack", pollId, track, function(error, result){
      if(!error){
        return result
      }
    })
  }
}
