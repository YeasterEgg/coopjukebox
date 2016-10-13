import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { createContainer } from 'meteor/react-meteor-data'

import Waiter from '../common/Waiter.jsx'

import { Polls } from '../../api/polls.js'

export default class PollsIndex extends Component {

  render(){
    console.log(this.props)
    if(!this.props.subscriptionsReady){
      return(
        <Waiter />
      )
    }else{
      return(
        <div className="polls_index--container">
          {this.renderPollsUrl()}
        </div>
      )
    }
  }

  renderPollsUrl(){
    return(
      <div className="polls_index--polls_index">
        {this.props.polls.map(function(poll){
          return(
            <a key={poll._id} href={Meteor.absoluteUrl() + poll.chosenName}>
              {poll.chosenName}
            </a>
          )
        }.bind(this))}
      </div>
    )
  }

}

export default createContainer(() => {

  const pollsSubscription = Meteor.subscribe('polls.active')

  return {
    polls: Polls.find().fetch(),
    subscriptionsReady: pollsSubscription.ready()
  }
}, PollsIndex)
