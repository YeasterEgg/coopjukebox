import { Meteor } from 'meteor/meteor'
import { Polls } from '../../imports/api/polls.js'
import { Playlists } from '../../imports/api/playlists.js'

Meteor.methods({

  "poll.startPoll": function(playlist){
    if(Polls.findOne({playlistId: playlist._id, active: true})){
      return false
    }else{
      pollSize = 50
      availableChoices = cf.randomProperties(playlist.songlist, pollSize)
      Polls.insert({
        playlistId: playlist._id,
        active: true,
        songlist: playlist.songlist,
        availableChoices: availableChoices,
        votersChoices: {},
        startedAt: new Date,
        reloadTimeout: 60000,
        reloadExchangeRate: 0.2,
        winners: [],
      }, function(err,res){
        if(res){
          Meteor.call('poll.startLifecycle', res)
        }
      })
    }
  },

  "poll.startLifecycle": function(pollId){

    // The poll starts! It calls 2 different branches of cycles:
    // - The winning song lifecycle, which every n minutes selects the most voted song to add to the playlist
    // - The songlist reload lyfecicle, which every n minutes changes the songlist with a specific algorithm

    poll = Polls.findOne({_id: pollId})
    pollReloadTimeout = poll.reloadTimeout
    firstSongTimeout = 30000

    Meteor.setTimeout(function(){
      Meteor.call("poll.winnerPrize", pollId)
    }, firstSongTimeout)

    // Meteor.setTimeout(function(){
    //   Meteor.call("poll.reloadSongs", pollId)
    // }, pollReloadTimeout)
  },

  "poll.winnerPrize": function(pollId){

    // Finds the Poll and orders for votes
    // Then the winner is added to the playlist and removed from the current songlist, throwing in one song
    // from the voters' choiches

    poll   = Polls.findOne({_id: pollId})
    if(poll.active === false){
      console.log('The poll has been stopped, silly you!')
      return false
    }
    orderedTracks = _.sortBy(Object.values(poll.availableChoices), function(track){
      return track.votes
    })
    winner = orderedTracks.slice(-1)[0]
    winnerUri = "spotify:track:" + winner.spotifyId
    Meteor.call('playlist.addTrackToPlaylist', poll.playlistId, winnerUri)

    delete poll.songlist["track_" + winner.spotifyId]
    delete poll.availableChoices["track_" + winner.spotifyId]
    delete poll.votersChoices["track_" + winner.spotifyId]

    firstVoterChoice = _.sortBy(poll.votersChoices, function(track){ return track.added_at })[0]
    if(firstVoterChoice){
      poll.availableChoices["track_" + firstVoterChoice.spotifyId] = firstVoterChoice
      console.log(poll.availableChoices)
    }else{
      remainingChoices = _.filter(poll.songlist, function(track){ poll.availableChoices["track_" + track.spotifyId] === undefined } )
      poll.availableChoices["track_" + remainingChoices[0].spotifyId] = remainingChoices[0]
    }

    pollUpdates = {
      $push: {winners: winner},
      $set: {
            availableChoices: poll.availableChoices,
            songlist: poll.songlist,
            votersChoices: poll.votersChoices,
            },
    }
    Polls.update({_id: pollId}, pollUpdates)
    // Meteor.setTimeout(function(){
    //   Meteor.call("poll.winnerPrize", pollId)
    // }, (winner.duration_ms + 10000))
  },

  "poll.reloadSongs": function(pollId){

    poll = Polls.findOne({_id: pollId})
    if(poll.active === false){
      console.log('The poll has been stopped, silly you!')
      return false
    }
    orderedTracks = _.sortBy(Object.values(poll.availableChoices), function(track){
      return track.votes
    })

    // Found the Poll and ordered for votes

    nToBeChanged              = Math.floor(poll.availableChoices.length * pollExchangeRate)

    // pollExchangeRate is the part of the total pool which will be removed from the voting pool

    nTracksFromVoters         = Math.ceil(toBeChanged / 2)
    tracksFromVoters          = cf.randomProperties(poll.votersChoices, nTracksFromVoters)

    // Half of the new songs will be selected from the voters' choiches

    nTracksFromSonglist       = nToBeChanged - Object.keys(tracksFromVoters).length
    tracksFromSonglist        = cf.randomProperties(poll.songlist,nTracksFromSonglist)

    // The other half (or more, if there are not enough voters' choiches) will be selected from the songlist

    remainingAvailableChoices = orderedTracks.slice((nToBeChanged-1),-1)
    newAvailableChoices       = Object.assign(tracksFromVoters, tracksFromSonglist)


    pollUpdates = {
      $push: {winners: winner},
      $set: {
            availableChoices: availableChoices,
            songlist: poll.songlist,
            votersChoices: poll.votersChoices,
            startedAt: new Date,
            closesAt: new Date(new Date - - winner.duration_ms),
            },
      $inc: {pollsLeft: -1}
    }

    Polls.update({_id: pollId}, pollUpdates)

    newPoll = Polls.findOne({_id: pollId})

    Meteor.setTimeout(function(){
      Meteor.call("poll.endSinglePollTurn", newPoll._id, playlist)
    }, winner.duration_ms)
  },

  "poll.addVoteToTrack": function(poll, track){
    increment = {['availableChoices.track_'+track.spotifyId+'.votes']: 1}
    Polls.update({_id: poll._id}, {$inc: increment})
    return true
  },

  "poll.addTrackToVoterChoices": function(poll, track){
    decoratedTrack = Meteor.call("decorateTrack", user, track)
    decoratedTrack.added_at = new Date
    Polls.update({_id: poll._id}, {$set: {['votersChoices.track_'+decoratedTrack.spotifyId]: decoratedTrack}})
    return true
  },

  "poll.stopPoll": function(pollId){
    Polls.update({_id: pollId}, {$set: {active: false}})
  },
})
