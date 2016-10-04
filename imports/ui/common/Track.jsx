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
      <div className="tracklist--track_cell" onClick={function(){this.props.clickOnTrackAction(this.props.track)}.bind(this)} >
        <div className="tracklist--track_title">{this.props.track.name}</div>
        <div className="tracklist--track_info">
          {this.renderVotes()}
          <div className="tracklist--track_duration">{minutes + ":" + seconds}</div>
          <div className="tracklist--track_artist">{this.props.track.artist}</div>
        </div>
      </div>
    )
  }

  renderVotes(){
    if(this.props.track.votes){
      return(
        <div className="tracklist--track_votes">{"Votes: " + this.props.track.votes}</div>
      )
    }else{
      return null
    }
  }

}

Track.propTypes = {
  track: PropTypes.object.isRequired,
  clickOnTrackAction: PropTypes.func.isRequired
}
