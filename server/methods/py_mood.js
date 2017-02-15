import { Meteor } from 'meteor/meteor'
import { LoggedUsers } from '../../imports/api/loggedUsers.js'
import { Playlists } from '../../imports/api/playlists.js'
import { Polls } from '../../imports/api/polls.js'
config_py_mood = require('../../imports/lib/config_py_mood.js')

Meteor.methods({

  "pyMood.sendPlaylist": function(pollId, pyMoodHost = "https://pymood.grokked.it/playlist"){
    poll = Polls.findOne({_id: pollId})
    playlist = poll.availableChoices
    ts = String(Date.now())
    token = Meteor.call('pyMood.validToken', ts)
    form = {'playlist': playlist,
            'token': {'token': token, 'ts': ts}
          }
    headers = {"content-type": "application/json"}
    result = postApiPymoodWrapper(pyMoodHost, headers, JSON.stringify(form))
    return result
  },

  "pyMood.validToken": function(ts){
    token = config_py_mood.digested(ts)
    return token
  }

})
