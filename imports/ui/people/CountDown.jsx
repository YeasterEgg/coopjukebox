import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
cf = require('../../lib/commonFunctions.js')

export default class CountDown extends Component {

  constructor(props){
    super(props)
    this.state = {
      secondsRemaining: 0
    }
  }

  componentDidMount(){
    countDown = Meteor.setInterval(function(){
      this.decrementSecondsRemaining()
      return true
    }.bind(this), 1000)
  }

  componentWillUnmount(){
    clearInterval(countDown)
  }

  componentWillMount(){
    secondsRemaining = Math.floor((this.props.endingTime - new Date) / 1000)
    this.setState({secondsRemaining: secondsRemaining})
    return true
  }

  decrementSecondsRemaining(){
    this.setState({secondsRemaining: this.state.secondsRemaining - 1})
    return true
  }

  render(){
    return (
      <div className="countdown--clock">
        <span>{cf.secondsToMinutes(this.state.secondsRemaining)}</span>
      </div>
    )
  }

}
