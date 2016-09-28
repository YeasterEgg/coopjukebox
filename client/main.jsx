import React from 'react'
import { Meteor } from 'meteor/meteor'
import { render } from 'react-dom'
import Pollifier from '../imports/ui/Pollifier.jsx'

apiHelper = require('../imports/lib/apiHelper.js')

Meteor.startup(() => {
  queryParams = apiHelper.returnParams(window.location.href)
  render(<Pollifier queryParams={queryParams} />, document.getElementById('render-target'));
});
