import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

export default class PollWinner extends Component {

  constructor(props){
    super(props)
    this.state = {
      message: false,
    }
  }


  render(){
    if(this.state.message){
      return (
        <div className="playlist_manager--poll_winner">{this.state.message}</div>
      )
    }else{
      return null
    }
  }

  componentWillReceiveProps(nextprops){
    if(nextprops.winner && this.props.winner !== nextprops.winner){
      this.props.setNotice({text: "This poll has ended, and " + nextprops.winner.name + "!", kind: "success"})
      // message = "Ha vinto: " + nextprops.winner.name
      // Meteor.setTimeout(function(){
      //   this.setState({message: false})
      // }.bind(this), 3000)
      // this.setState({message: message})
    }
  }
}
