import { Meteor } from 'meteor/meteor'
import { Polls } from '../imports/api/polls.js'
import { HTTP } from 'meteor/http'

ma = require('../imports/lib/musicAnalyzer.js')
cf = require('../imports/lib/commonFunctions.js')
config = require('../imports/lib/config.js')
querystring = require('querystring')

getApiWrapper = Meteor.wrapAsync(getApi)
postApiWrapper = Meteor.wrapAsync(postApi)
updateTokenWrapper = Meteor.wrapAsync(updateToken)
postApiPymoodWrapper = Meteor.wrapAsync(postApiPymood)

Meteor.startup(() => {
  Polls.update({active: true}, {$set: {active: false}} )
})

Meteor.methods({

  "getAuthUrl": function(sessionId){
    return getAuth(config.clientId, config.redirectUrl, config.scope, sessionId, config.authUrl)
  },

  "track.decorateTrack": function(user, track){
    updateTokenWrapper(user)
    url = config.trackFeaturesUrl + track.spotifyId
    headers = {'Authorization': 'Bearer ' + user.token.accessToken }
    result = getApiWrapper(url, headers)
    track.features = result.body
    track = ma.mergeFeatures(track)
    return track
  },

  "track.decorateTracks": function(user, rawTracks){
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
  },

  "track.searchTracks": function(query, limit = 20){
    params = {
      q: query,
      type: "track",
      limit: limit
    }
    url = config.searchUrl + querystring.stringify(params)
    result = getApiWrapper(url, {})
    searchResult = result.body
    if(searchResult.tracks && searchResult.tracks.items){
      tracks = _.map(searchResult.tracks.items, function(track){
        return cf.getTrackValues(track)
      })
    }else{
      tracks = false
    }
    return tracks
  }


})

Meteor.onConnection(function(connection){
  id = Math.random().toString(36).replace(/[^a-z]+/g, '')

  HTTP.call("GET", "https://grokked.it/visited_website", {params: {site: "CoopJukebox", id: id}}, function(error, data){
    console.log(data)
    console.log(error)
  });

  connection.onClose(function(){
    HTTP.call("GET", "https://grokked.it/goodbye_website", {params: {site: "CoopJukebox", id: id}}, function(error, data){
      console.log(data)
      console.log(error)
    });
  })


})

