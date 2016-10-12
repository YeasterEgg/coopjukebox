import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

export default class CountDown extends Component {

  constructor(props){
    super(props)
    this.state = {
      secondsRemaining: 0
    }
  }



  componentDidMount(){
    secondsRemaining = this.props.endingTime - (new Date)
    this.setState({secondsRemaining: secondsRemaining})
    (function(){
      setInterval(function(){
        this.setState({secondsRemaining: this.state.secondsRemaining - 1})
      }.bind(this), 1000)
    }.bind(this))()
  }

  render(){
    return (
      <div className="voter--voter_clock">
        <span>Time remaining for Vote!</span>
        <span>{this.state.secondsRemaining}</span>
      </div>
    )
  }

}
