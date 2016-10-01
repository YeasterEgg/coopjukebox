import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'
import Track from './Track.jsx'

export default class TrackList extends Component {

  render(){
    return(
      <div className="homepage--tracklist">
        {this.props.tracks.map(function(track){
          return(
            <Track track={track} key={track.id} addTrack={this.props.addTrack.bind(this)}/>
          )
        }.bind(this))}
      </div>
    )
  }

  renderTrack(track){
    return(
      <div>{track.name}</div>
    )
  }


}

TrackList.propTypes = {
  tracks: PropTypes.array.isRequired,
  addTrack: PropTypes.func.isRequired
}
