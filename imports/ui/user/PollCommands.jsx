import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

export default class PollCommands extends Component {

  constructor(props){
    super(props)
    this.state = {
      stopped: false
    }
  }

  render(){
    if(!this.props.poll){
      return(
        <div>
          {this.renderInactivePoll()}
        </div>
      )
    }else{
      return(
        <div>
          {this.renderActivePoll()}
        </div>
      )
    }
  }

  renderInactivePoll(){
    return(
      <div className="playlist_manager--poll">
        <div className="playlist_manager--form_part">
          <label htmlFor="poll_size">Number of possible choices</label>
          <input name="poll_size" id="poll_size" type="number" size="20" maxLength="3" min="2" max="6" step="1" defaultValue="2"/>
        </div>
        <div className="playlist_manager--form_part">
          <label htmlFor="poll_number">Number of consecutive polls</label>
          <input name="poll_number" id="poll_number" type="number" size="20" maxLength="3" min="2" max="12" step="1" defaultValue="2"/>
        </div>
        {this.renderButton()}
      </div>
    )
  }

  renderActivePoll(){
    return(
      <div className="playlist_manager--poll">
        {this.renderButton()}
        {this.renderPollStatus()}
        {this.renderTracksChosen()}
      </div>
    )
  }

  renderButton(){
    if(!this.props.poll){
      return(
        <button type="submit" className="playlist_manager--start_poll button-round pure-button pure-button-primary" onClick={this.startVoting.bind(this)}>
          Start Voting!
        </button>
      )
    }else if(!this.state.stopped){
      return(
        <button type="submit" className="playlist_manager--start_poll button-round pure-button button-error" onClick={this.stopCurrentPoll.bind(this)}>
          Stop polls with current
        </button>
      )
    }else{
      return(
        <button type="submit" className="playlist_manager--start_poll button-round pure-button button-error pure-button-disabled" disabled onClick={this.stopCurrentPoll.bind(this)}>
          Last poll still ongoing
        </button>
      )
    }
  }

  renderPollStatus(){
    return(
      Object.values(this.props.poll.availableChoices).map(function(track){
        return(
          <div className="playlist_manager--poll_track" key={track.spotifyId}>
            <span className="playlist_manager--poll_track_name">{track.name + " : " + track.votes}</span>
          </div>
        )
      })
    )
  }

  renderTracksChosen(){
    return(
      <div className="playlist_manager--chosen_container">
        <div className="playlist_manager--chosen_container_title">
          <span>Tracks Added by Users</span>
        </div>
        <div className="playlist_manager--chosen_container_songlist">
          {Object.values(this.props.poll.votersChoices).map(function(track){
            return(
              <div className="playlist_manager--chosen_track" key={track.spotifyId}>
                <span className="playlist_manager--chosen_track_name">{track.name}</span>
              </div>
            )
          }.bind(this))}
        </div>
      </div>
    )
  }

  stopCurrentPoll(){
    this.setState({stopped: true})
    Meteor.call("poll.stopPoll", this.props.poll._id)
  }

  startVoting(){
    this.setState({stopped: false})
    size = document.getElementById("poll_size").value
    number = document.getElementById("poll_number").value
    Meteor.call("poll.startPoll", this.props.playlist, size, number, function(error, result){
      if(result){
        this.setNotice(result)
      }
    }.bind(this))
  }
}
