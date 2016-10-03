import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'

export default class Track extends Component {

  render(){
    minutes = Math.floor(this.props.track.duration_ms / 60000)
    secondsInt = Math.floor((this.props.track.duration_ms % 60000)/1000)
    if(String(secondsInt).length == 1){
      seconds = "0" + secondsInt
    }else{
      seconds = secondsInt
    }
    return(
      // <div className="homepage--track" onClick={function(){this.props.addTrackToPoll(track)}.bind(this)} >
      <div className="track--cell" onClick={function(){this.props.clickOnTrack(this.props.track)}.bind(this)} >
        <span className="track--artist">{this.props.track.artist}</span>
        <span> - </span>
        <span className="track--title">{this.props.track.name}</span>
        <span className="track--length">{`(${minutes}:${seconds})`}</span>
        <span className="track--votes">{"Votes: " + this.props.track.votes}</span>
      </div>
    )
  }

}

Track.propTypes = {
  track: PropTypes.object.isRequired,
  clickOnTrack: PropTypes.func.isRequired
}
