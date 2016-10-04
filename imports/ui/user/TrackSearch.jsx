import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'
import Track from '../common/Track.jsx'

export default class TrackSearch extends Component {
  render(){
    return(
      <div className="homepage--tracksearch">
        {this.props.tracks.map(function(track){
          return(
            <Track track={track} key={track.id} clickOnTrack={this.props.addTrackToSonglist.bind(this)}/>
          )
        }.bind(this))}
      </div>
    )
  }
}

TrackSearch.propTypes = {
  tracks: PropTypes.array.isRequired,
  addTrackToSonglist: PropTypes.func.isRequired
}
