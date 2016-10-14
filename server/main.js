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
updateTokenWrapper = Meteor.wrapAsync(updateToken)

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
    updateTokenWrapper(user)
    url = config.playlistUrl(user._id)
    headers = {'Authorization': 'Bearer ' + user.token.accessToken }
    form = JSON.stringify(_.pick(playlist, ['name', 'public']))
    result = postApiWrapper(url, headers, form)
    if(result.body.error){
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
      startedAt: new Date,
    }, function(){
      return true
    })
  },

  "playlist.importPlaylist": function(importedPlaylistSpotifyId, importedUserId, playlist){
    user = LoggedUsers.findOne({_id: playlist.userId})
    updateTokenWrapper(user)
    url = config.playlistTracksUrl(importedUserId, importedPlaylistSpotifyId)
    headers = {'Authorization': 'Bearer ' + user.token.accessToken }
    result = getApiWrapper(url, headers)
    if(!result.body.error){
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
    updateTokenWrapper(user)
    url = config.playlistAddTrack(user._id, playlist._id)
    form = JSON.stringify({
      uris: [trackUri]
    })
    headers = {'Authorization': 'Bearer ' + user.token.accessToken }
    result = postApiWrapper(url, headers, form)
  },

  "playlist.punishment": function(playlist){
    Meteor.call("playlist.addTrackToPlaylist", playlist, _.sample(config.punishmentUris))
  },

/// POLL METHODS

  "poll.startPoll": function(playlist, pollSize, number){
    if(pollSize > 6 || pollSize < 2 || number > 12 || number < 2){
      Meteor.call("playlist.punishment", playlist)
      return {kind: "error", text: "Fuck you"}
    }
    availableChoices = cf.randomProperties(playlist.songlist,pollSize)
    Polls.insert({
      playlistId: playlist._id,
      songlist: playlist.songlist,
      availableChoices: availableChoices,
      votersChoices: {},
      pollSize: parseInt(pollSize),
      startedAt: new Date,
      active: true,
      winners: [],
      pollsLeft: parseInt(number),
      closesAt: new Date(new Date - - 300000),
      private: false
    }, function(err,res){
      if(!err){
        Meteor.setTimeout(function(){
          Meteor.call("poll.endPoll", res, playlist)
        }, 60000 * 5)
        return {kind: "success", text: res}
      }
    })
  },

  "poll.addVoteToTrack": function(poll, track){
    increment = {['availableChoices.track_'+track.spotifyId+'.votes']: 1}
    Polls.update({_id: poll._id}, {$inc: increment})
    return true
  },

  "poll.addTrackToVoterChoices": function(poll, track){
    Polls.update({_id: poll._id}, {$set: {['votersChoices.track_'+track.spotifyId]: track}})
    return true
  },

  "poll.endPoll": function(pollId, playlist){
    closingPoll = Polls.findOne({_id: pollId})
    orderedTracks = _.sortBy(Object.values(closingPoll.availableChoices), function(track){
      return track.votes
    })
    winner = orderedTracks.slice(-1)[0]
    winnerUri = "spotify:track:" + winner.spotifyId
    Meteor.call('playlist.addTrackToPlaylist', playlist, winnerUri)
    if(closingPoll.pollsLeft > 0){
      delete closingPoll.songlist["track_" + winner.spotifyId]
      delete closingPoll.votersChoices["track_" + winner.spotifyId]
      nTracksFromVoters = Math.ceil(closingPoll.pollSize / 2)
      tracksFromVoters = cf.randomProperties(closingPoll.votersChoices, nTracksFromVoters)

      nTracksFromSonglist = closingPoll.pollSize - Object.keys(tracksFromVoters).length
      tracksFromSonglist = cf.randomProperties(closingPoll.songlist,nTracksFromSonglist)

      availableChoices = Object.assign(tracksFromVoters, tracksFromSonglist)

      // TODO: Add a check to add tracks if the merge has 2 or more identical tracks that will be used only once

      pollUpdates = {
        $push: {winners: winner},
        $set: {
              availableChoices: availableChoices,
              songlist: closingPoll.songlist,
              votersChoices: closingPoll.votersChoices,
              startedAt: new Date,
              closesAt: new Date(new Date - - winner.duration_ms),
              },
        $inc: {pollsLeft: -1}
      }
      Polls.update({_id: pollId}, pollUpdates)
      newPoll = Polls.findOne({_id: pollId})
      Meteor.setTimeout(function(){
        Meteor.call("poll.endPoll", newPoll._id, playlist)
      }, winner.duration_ms)
    }else{
      Polls.update({_id: pollId}, {$push: {winners: winner}, $set: {active: false}})
    }
  },

  "poll.stopPoll": function(pollId){
    Polls.update({_id: pollId}, {$set: {pollsLeft: 0}}, function(result){
      console.log(result)
      return result
    })
  },

/// GENERIC METHODS

  "getAuthUrl": function(sessionId){
    return getAuth(config.clientId, config.redirectUrl, config.scope, sessionId, config.authUrl)
  },

})
