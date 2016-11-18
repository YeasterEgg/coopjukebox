import { Meteor } from 'meteor/meteor'
import { LoggedUsers } from '../../imports/api/loggedUsers.js'
import { Playlists } from '../../imports/api/playlists.js'
config_py_mood = require('../../imports/lib/config_py_mood.js')

Meteor.methods({

  "pyMood.sendPlaylistFromUri": function(playlistUri = "spotify:user:11121168332:playlist:0MimWdVjSFWw6qFGYmqKEs", pyMoodHost){
    user = LoggedUsers.findOne({"_id": "11121168332"})

    updateTokenWrapper(user)

    uri = playlistUri.split(":")
    if(uri.length != 5) return false
    importedUserId = uri[2]
    importedPlaylistSpotifyId = uri[4]

    url = config.playlistTracksUrl(importedUserId, importedPlaylistSpotifyId)
    headers = {'Authorization': 'Bearer ' + user.token.accessToken }
    result = getApiWrapper(url, headers)
    if(!result.body.error){
      rawTracks = result.body.items
      songlist = Meteor.call("track.decorateTracks", user, rawTracks)
      result = postApiWrapper(pyMoodHost, )
    }
  },

  "pyMood.sendPlaylist": function(pyMoodHost = "http://localhost:4000/v0.1/playlist", playlist = Playlists.findOne({}), mood = "Happy"){
    ts = String(Date.now())
    token = Meteor.call('pyMood.validToken', ts)
    playlist["mood"] = mood
    form = {'playlist': playlist, 'token':
      {'token': token, 'ts': ts}
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
          console.log(response)
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
