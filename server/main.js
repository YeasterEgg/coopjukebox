import { Meteor } from 'meteor/meteor'
import { LoggedUsers } from '../imports/api/loggedUsers.js'
import { Polls } from '../imports/api/polls.js'
import { Playlists } from '../imports/api/playlists.js'
const crypto = require('crypto')

Meteor.startup(() => {
  Polls.update({active: true}, {$set: {active: false}} )
})

getApiWrapper = Meteor.wrapAsync(getApi)
postApiWrapper = Meteor.wrapAsync(postApi)
// updateTokenWrapper = Meteor.wrapAsync(updateToken)

Meteor.methods({

/// LOGGEDUSER METHODS

  'loggedUsers.fromSessionId': function(sessionId){
      currentUser = LoggedUsers.findOne({sessionId: sessionId})
      if(currentUser){
        return {userId: currentUser._id, playlists: currentUser.playlists}
      }else{
        return {userId: false, playlists: []}
      }
  },

  "loggedUsers.findOrCreate": function(code, sessionId){
    tokenUrl = config.tokenUrl
    tokenHeaders = {'Authorization': 'Basic ' + (new Buffer(config.clientId + ':' + config.clientSecret).toString('base64'))}
    form = {
            code: code,
            redirect_uri: config.redirectUrl,
            grant_type: 'authorization_code'
          }
    getToken = postApiWrapper(tokenUrl, tokenHeaders, form)

    userUrl = config.userUrl
    userHeaders = { 'Authorization': 'Bearer ' + getToken.body.access_token }
    getUserData = getApiWrapper(userUrl, userHeaders)

    if(getUserData.body.error) return false

    token = {
        accessToken: getToken.body.access_token,
        tokenType: getToken.body.token_type,
        expiresIn: getToken.body.expires_in,
        refreshToken: getToken.body.refresh_token,
        scope: getToken.body.scope,
        validationStart: new Date,
      }

    existantUser = LoggedUsers.findOne({_id: getUserData.body.id})

    if(existantUser){
      LoggedUsers.update({_id: getUserData.body.id}, {$set: {sessionId: sessionId, token: token}})
    }else{
      LoggedUsers.insert({
        _id: getUserData.body.id,
        name: getUserData.body.display_name,
        email: getUserData.body.email,
        uri: getUserData.body.uri,
        sessionId: sessionId,
        playlists: [],
        token: token,
        createdAt: new Date,
      })
    }
    return getUserData.body.id
  },

/// PLAYLIST METHODS

  "playlists.create": function(user, playlist){
    updateToken(user)
    url = config.playlistUrl(user._id)
    headers = {'Authorization': 'Bearer ' + user.token.accessToken }
    form = JSON.stringify(_.pick(playlist, ['name', 'public']))
    result = postApiWrapper(url, headers, form)
    if(result.body.error){
      console.log(result.body)
      return false
    }

    sameName = Playlists.find({chosenName: playlist.name}).fetch().length
    if(sameName > 0){
      urlParam = playlist.name + "_" + sameName
    }else{
      urlParam = playlist.name
    }

    Playlists.insert({
      _id: result.body.id,
      spotifyUrl: result.body.external_urls.spotify,
      name: playlist.name,
      chosenName: urlParam,
      userId: user._id,
      songlist: {},
      playlistLength: playlist.length,
      pollSize: 4,
      pollDuration: playlist.duration,
      startedAt: new Date,
    })
  },

  "playlist.importPlaylist": function(importedPlaylistSpotifyId, importedUserId, playlist){
    user = LoggedUsers.findOne({_id: playlist.userId})
    updateToken(user)
    url = config.playlistTracksUrl(importedUserId, importedPlaylistSpotifyId)
    headers = {'Authorization': 'Bearer ' + user.token.accessToken }
    result = getApiWrapper(url, headers)
    if(!result.body.error){
      console.log(result.body)
      songlist = {}
      _.map(result.body.items, function(item){
        parsedTrack = cf.getTrackValues(item.track)
        parsedTrack.votes = 0
        songlist["songlist.track_" + item.track.id] = parsedTrack
      })
      Playlists.update({_id: playlist._id}, {$set: songlist})
      return result.body
    }
  },

  "playlist.addTrackToSonglist": function(playlist, track){
    Playlists.update({_id: playlist._id}, {$set: {['songlist.track_'+track.spotifyId]: track}})
    return true
  },

  "playlist.removeTrackFromSonglist": function(playlist, track){
    Playlists.update({_id: playlist._id}, {$unset: {['songlist.track_'+track.spotifyId]: ''}})
    return true
  },

  "playlist.addTrackToPlaylist": function(playlist, trackUri){
    user = LoggedUsers.findOne({_id: playlist.userId})
    updateToken(user)
    url = "https://api.spotify.com/v1/users/" + user._id + "/playlists/" + playlist._id + "/tracks"
    form = JSON.stringify({
      uris: [trackUri]
    })
    headers = {'Authorization': 'Bearer ' + user.token.accessToken }
    result = postApiWrapper(url, headers, form)
  },

/// POLL METHODS

  "poll.startPoll": function(playlist){
    availableChoices = cf.randomProperties(playlist.songlist,playlist.pollSize)
    Polls.insert({
      playlistId: playlist._id,
      songlist: playlist.songlist,
      availableChoices: availableChoices,
      pollSize: playlist.pollSize,
      startedAt: new Date,
      pollDuration: playlist.pollDuration,
      active: true,
      winners: [],
      pollsLeft: parseInt(playlist.playlistLength)
    }, function(err,res){
      if(!err){
        Meteor.setTimeout(function(){
          Meteor.call("poll.endPoll", res, playlist)
        }, 60000 * playlist.pollDuration)
        return res
      }
    })
  },

  "poll.addVoteToTrack": function(poll, track){
    increment = {['availableChoices.track_'+track.spotifyId+'.votes']: 1}
    Polls.update({_id: poll._id}, {$inc: increment})
  },

  "poll.endPoll": function(pollId, playlist){
    closingPoll = Polls.findOne({_id: pollId})
    orderedTracks = _.sortBy(Object.values(closingPoll.availableChoices), function(track){
      return track.votes
    })
    winner = orderedTracks.slice(-1)[0]
    winnerUri = "spotify:track:" + winner.spotifyId
    console.log("And the winner issssss.... " + winner.name)
    Meteor.call('playlist.addTrackToPlaylist', playlist, winnerUri)
    if(closingPoll.pollsLeft > 0){
      console.log("New poll!")
      delete closingPoll.songlist["track_" + winner.spotifyId]
      availableChoices = cf.randomProperties(closingPoll.songlist,closingPoll.pollSize)
      pollUpdates = {
        $push: {winners: winner},
        $set: {
              availableChoices: availableChoices,
              songlist: closingPoll.songlist
              },
        $inc: {pollsLeft: -1}
      }
      Polls.update({_id: pollId}, pollUpdates)
      newPoll = Polls.findOne({_id: pollId})
      Meteor.setTimeout(function(){
        Meteor.call("poll.endPoll", newPoll._id, playlist)
      }, 60000 * newPoll.pollDuration)
    }else{
      console.log('no more polls :(')
      Polls.update({_id: pollId}, {$push: {winners: winner}, $set: {active: false}})
    }
  },

/// GENERIC METHODS

  "getAuthUrl": function(sessionId){
    return getAuth(config.clientId, config.redirectUrl, config.scope, sessionId, config.authUrl)
  },

})
