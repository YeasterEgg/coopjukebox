import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import TrackList from '../common/TrackList.jsx'

export default class VoterVote extends Component {
  render(){
    return(
      <div className="voter--voter_tracklist">
        <TrackList tracks={this.props.tracks} clickOnTrackAction={this.props.clickOnTrackAction.bind(this)} withVotes={true}/>
      </div>
    )
  }
}
