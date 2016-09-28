import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import Pollifier from '../imports/ui/Pollifier.jsx';

Meteor.startup(() => {
  render(<Pollifier />, document.getElementById('render-target'));
});
