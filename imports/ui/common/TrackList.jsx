import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'
import Track from '../common/Track.jsx'

export default class TrackList extends Component {

  render(){
    length = tracks.length
    return(
      <div className="tracklist--tracklist_container">
        {this.props.tracks.map(function(track){
          return(
            <Track track={track} key={track.spotifyId} clickOnTrackAction={this.props.clickOnTrackAction.bind(this)} withVotes={this.props.withVotes} length={length}/>
          )
        }.bind(this))}
      </div>
    )
  }
}

TrackList.propTypes = {
  tracks: PropTypes.array.isRequired,
  clickOnTrackAction: PropTypes.func.isRequired,
  withVotes: PropTypes.bool.isRequired
}
