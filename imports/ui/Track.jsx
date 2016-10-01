import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'

export default class Track extends Component {

  render(){
    track = this.props.track
    artist = track.artists[0].name
    minutes = Math.floor(track.duration_ms / 60000)
    secondsInt = Math.floor((track.duration_ms % 60000)/1000)
    if(String(secondsInt).length == 1){
      seconds = "0" + secondsInt
    }else{
      seconds = secondsInt
    }
    return(
      <div className="homepage--track" onClick={this.props.addTrack.bind(track)} >
        <span className="homepage--track_artist">{artist}</span>
        <span> - </span>
        <span className="homepage--track_title">{track.name}</span>
        <span className="homepage--track_length">{`(${minutes}:${seconds})`}</span>
      </div>
    )
  }

}

Track.propTypes = {
  track: PropTypes.object.isRequired,
}
