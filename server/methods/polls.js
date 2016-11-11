Meteor.methods({

  "poll.startPoll": function(playlist){
    if(Polls.findOne({playlistId: playlist._id, active: true})){
      return false
    }else{
      availableChoices = cf.randomProperties(playlist.songlist, 50)
      Polls.insert({
        playlistId: playlist._id,
        active: true,
        songlist: playlist.songlist,
        availableChoices: playlist.songlist,
        votersChoices: {},
        startedAt: new Date,
        reloadTimeout: 600000,
        reloadExchangeRate: 0.2,
        winners: [],
      }, function(err,res){
        if(!err){
          Meteor.call('poll.startLifecycle', res)
          return {kind: "success", text: res}
        }
      })

    }
  },

  "poll.startLifecycle": function(pollId){
    poll = Polls.findOne({_id: pollId})
    pollReloadTimeout = poll.reloadTimeout
    firstSongTimeout = 300000
    firstTime = true
    Meteor.setTimeout(function(){
      Meteor.call("poll.winnerPrize", pollId, firstTime)
    }, firstSongTimeout)
    Meteor.setTimeout(function(){
      Meteor.call("poll.reloadSongs", pollId)
    }, firstSongTimeout)
  },

  "poll.winnerPrize": function(pollId, firstTime = false){
    poll   = Polls.findOne({_id: pollId})
    return poll
  },

  "poll.endSinglePollTurn": function(pollId, playlist){
    // What happens here:

    closingPoll = Polls.findOne({_id: pollId})
    orderedTracks = _.sortBy(Object.values(closingPoll.availableChoices), function(track){
      return track.votes
    })

    // Found the Poll and ordered for votes

    winner = orderedTracks.slice(-1)[0]
    winnerUri = "spotify:track:" + winner.spotifyId
    Meteor.call('playlist.addTrackToPlaylist', playlist, winnerUri)

    // Found the winner and added to the playlist

    delete closingPoll.songlist["track_" + winner.spotifyId]
    delete closingPoll.votersChoices["track_" + winner.spotifyId]

    // Removed the winning song from the poll playlist

    nToBeChanged              = Math.floor(closingPoll.availableChoices.length * pollExchangeRate)

    // pollExchangeRate is the part of the total pool which will be removed from the voting pool

    nTracksFromVoters         = Math.ceil(toBeChanged / 2)
    tracksFromVoters          = cf.randomProperties(closingPoll.votersChoices, nTracksFromVoters)

    // Half of the new songs will be selected from the voters' choiches

    nTracksFromSonglist       = nToBeChanged - Object.keys(tracksFromVoters).length
    tracksFromSonglist        = cf.randomProperties(closingPoll.songlist,nTracksFromSonglist)

    // The other half (or more, if there are not enough voters' choiches) will be selected from the songlist

    remainingAvailableChoices = orderedTracks.slice((nToBeChanged-1),-1)
    newAvailableChoices       = Object.assign(tracksFromVoters, tracksFromSonglist)


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
      Meteor.call("poll.endSinglePollTurn", newPoll._id, playlist)
    }, winner.duration_ms)
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

  "poll.stopPoll": function(pollId){
    Polls.update({_id: pollId}, {$set: {active: false}})
  },
})
