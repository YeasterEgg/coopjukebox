import { Meteor } from 'meteor/meteor'
import { LoggedUsers } from '../../imports/api/loggedUsers.js'
import { Playlists } from '../../imports/api/playlists.js'
config_py_mood = require('../../imports/lib/config_py_mood.js')

Meteor.methods({

  "pyMood.sendPlaylist": function(pyMoodHost = "http://localhost:4000/v0.2/playlist", playlist_id = null, mood = null, training = null){
    ts = String(Date.now())
    token = Meteor.call('pyMood.validToken', ts)
    if(playlist_id){
      playlist = Playlists.findOne({"_id": playlist_id})
    }else{
      playlist = Playlists.findOne({})
    }
    if(training){
      playlist["training"] = training
    }else{
      playlist["training"] = (playlist["creatorId"] == "11121168332" && config_py_mood.moods.includes(playlist["name"]) )
    }
    if(mood){
      playlist["mood"] = mood
    }else if(config_py_mood.moods.includes(playlist["name"])){
      playlist["mood"] = playlist["name"]
    }else{
      playlist["mood"] = "none"
    }
    form = {'playlist': playlist,
            'token': {'token': token, 'ts': ts}
          }
    headers = {"content-type": "application/json"}
    options = {
      url: pyMoodHost,
      headers: headers,
      body: JSON.stringify(form),
      json: true
    };
    request.post(options, function(error, result){
      if(!error){
        response = result.body
        if(response["error"]){
          console.log("BAD")
        }else{
          console.log("GOOD")
          console.log(response)
        }
      }
    })
  },

  "pyMood.validToken": function(ts){
    token = config_py_mood.digested(ts)
    return token
  }

})
