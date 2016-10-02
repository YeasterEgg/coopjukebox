import React from 'react'
import { Meteor } from 'meteor/meteor'
import { render } from 'react-dom'
import PollRouter from '../imports/ui/PollRouter.jsx'

Meteor.startup(() => {
  render(<PollRouter />, document.getElementById('render-target'));
});
