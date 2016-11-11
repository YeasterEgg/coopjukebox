import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

export default class PollCommands extends Component {

  constructor(props){
    super(props)
    this.state = {
      stopped: false,
      pollSize: 50 // to be set!
    }
  }

  render(){
    if(!this.props.poll){
      return(
        <div>
          {this.renderButton()}
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
    Meteor.call("poll.startSinglePoll", this.props.playlist, this.state.pollSize, function(error, result){
      if(result){
        console.log(result)
        this.setNotice(result)
      }else{
        alert(error)
      }
    }.bind(this))
  }
}
