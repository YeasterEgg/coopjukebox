import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import TrackSearcher from '../common/TrackSearcher.jsx'

export default class VoterPropose extends Component {
  render(){
    return(
      <div className="voter--voter_searchlist">
        <TrackSearcher clickOnTrackAction={this.props.clickOnTrackAction.bind(this)} limit="10"/>
      </div>
    )
  }
}
