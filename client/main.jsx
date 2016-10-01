import React from 'react'
import { Meteor } from 'meteor/meteor'
import { render } from 'react-dom'
import PollRouter from '../imports/ui/PollRouter.jsx'

apiHelper = require('../imports/lib/apiHelper.js')


Meteor.startup(() => {
  // // First filter, if it's a redirection from Spotify Auth Site

  // queryParams = apiHelper.returnParams(window.location.href)
  // if(queryParams["code"] && (queryParams["state"] == localStorage.getItem("sessionId"))){
  //   Meteor.call("createUser", queryParams["code"], queryParams["state"])
  //   window.location.replace("http://localhost:3000")
  // }
  render(<PollRouter />, document.getElementById('render-target'));
});


// REMEMBER TO DIVIDE REAL HELPER FROM QUERY PARSER FOR SECURITY REASONS
