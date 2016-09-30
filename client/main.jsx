import React from 'react'
import { Meteor } from 'meteor/meteor'
import { render } from 'react-dom'
import Pollifier from '../imports/ui/Pollifier.jsx'
import { Tokens } from '../imports/api/tokens.js'

apiHelper = require('../imports/lib/apiHelper.js')

Meteor.startup(() => {
  queryParams = apiHelper.returnParams(window.location.href)
  if(queryParams["code"] && (queryParams["state"] == localStorage.getItem("sessionState"))){
    localStorage.removeItem("sessionState")
    Meteor.call("getToken", queryParams["code"])
  }
  render(<Pollifier />, document.getElementById('render-target'));
});


// REMEMBER TO DIVIDE REAL HELPER FROM QUERY PARSER FOR SECURITY REASONS
