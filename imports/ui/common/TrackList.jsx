import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'
import Track from '../common/Track.jsx'
import { Songlists } from '../../api/songlists.js'

export default class TrackList extends Component {

  render(){
    return(
      <div className="tracklist--tracklist_container" onClick={function(){console.log(this.props)}.bind(this)}>
        {this.props.tracks.map(function(track){
          return(
            <Track track={track} key={track.spotifyId} clickOnTrackAction={this.props.clickOnTrackAction.bind(this)} withVotes={this.props.withVotes}/>
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
