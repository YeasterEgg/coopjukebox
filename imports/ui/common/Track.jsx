import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
const ReactCSSTransitionGroup = require('react-addons-css-transition-group')
cf = require('../../lib/commonFunctions.js')

export default class Track extends Component {

  render(){
    length = cf.secondsToMinutes(Math.floor(this.props.track.duration_ms / 1000))
    return(
      <ReactCSSTransitionGroup transitionName="fadeInFadeOut" transitionEnterTimeout={2000} transitionLeaveTimeout={500} component="a" className={"tracklist--track_cell tracklist--track_cell_"+length} href="#" onClick={function(event){event.preventDefault();this.props.clickOnTrackAction(this.props.track)}.bind(this)}>
        <div className="tracklist--track_title">{this.props.track.name}</div>
        <div className="tracklist--track_info">
          {this.renderVotes.bind(this)()}
          <div className="tracklist--track_duration">{length}</div>
          <div className="tracklist--track_artist">{this.props.track.artist}</div>
        </div>
      </ReactCSSTransitionGroup>
    )
  }

  renderVotes(){
    if(this.props.withVotes){
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
  clickOnTrackAction: PropTypes.func.isRequired,
  withVotes: PropTypes.bool.isRequired
}
