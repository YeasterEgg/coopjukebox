import { Meteor } from 'meteor/meteor'
import { Polls } from '../imports/api/polls.js'
const crypto = require('crypto')
ma = require('../imports/lib/musicAnalyzer.js')

Meteor.startup(() => {
  Polls.update({active: true}, {$set: {active: false}} )
})

getApiWrapper = Meteor.wrapAsync(getApi)
postApiWrapper = Meteor.wrapAsync(postApi)
updateTokenWrapper = Meteor.wrapAsync(updateToken)

Meteor.methods({

  "getAuthUrl": function(sessionId){
    return getAuth(config.clientId, config.redirectUrl, config.scope, sessionId, config.authUrl)
  },

  "decorateTrack": function(user, track){
    updateTokenWrapper(user)
    url = config.trackFeaturesUrl + track.spotifyId
    headers = {'Authorization': 'Bearer ' + user.token.accessToken }
    result = getApiWrapper(url, headers)
    track.features = result.body
    track = ma.mergeFeatures(track)
    return track
  },

  "decorateTracks": function(user, rawTracks){
    updateTokenWrapper(user)
    ids = rawTracks.map(function(item){
      return item.track.id
    })
    url = config.trackFeaturesUrl + "?ids=" + ids.join(',')
    headers = {'Authorization': 'Bearer ' + user.token.accessToken }
    result = getApiWrapper(url, headers)
    features = result.body.audio_features
    songlist = {}
    rawTracks.map(function(item, index){
      newTrack = getTrackValues(item.track)
      newTrack.votes = 0
      newTrack.features = features[index]
      newTrack = ma.mergeFeatures(newTrack)
      songlist["songlist.track_" + newTrack.spotifyId] = newTrack
    })
    return songlist
  }

})
