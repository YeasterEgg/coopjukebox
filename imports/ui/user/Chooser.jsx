import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import TrackSearch from './TrackSearch.jsx'
import Waiter from './Waiter.jsx'

export default class Chooser extends Component {

  constructor(props){
    super(props)
    this.state = {
      pollId: false,
      trackSearch: []
    }
  }

  render(){
    if(this.state.pollId){
      return(<div className="homepage--father_container">{this.renderPage()}</div>)
    }else{
      return(<div className="homepage--father_container"><Waiter /></div>)
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

  renderPage(){
    return (
      <div>
        <div className="home--search_form">
          <input name="track_search" id="track_search" type="text" size="20" maxLength="50" onChange={this.searchTrack.bind(this)}/>
          <div className="home--search_results">
            {this.renderTrackSearch(this.state.trackSearch)}
          </div>
        </div>
        {this.renderTrackList(this.props.trackList)}
      </div>
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
