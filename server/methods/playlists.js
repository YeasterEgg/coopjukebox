Meteor.methods({

  "playlists.create": function(user, playlist){
    updateTokenWrapper(user)
    url = config.playlistUrl(user._id)
    headers = {'Authorization': 'Bearer ' + user.token.accessToken }
    form = JSON.stringify(_.pick(playlist, ['name', 'public']))
    result = postApiWrapper(url, headers, form)
    if(result.body.error){
      return false
    }

    cleanName = playlist.name.replace(/ /g,"_")
    sameNameSize = Playlists.find({chosenName: cleanName}).fetch().length
    if(sameNameSize > 0){
      urlParam = cleanName + "_" + sameNameSize
    }else{
      urlParam = cleanName
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
      rawTracks = result.body.items
      songlist = Meteor.call("decorateTracks", user, rawTracks)
      Playlists.update({_id: playlist._id}, {$set: songlist})
      return songlist
    }
  },

  "playlist.addTrackToSonglist": function(playlist, track){
    user = LoggedUsers.findOne({_id: playlist.userId})
    decoratedTrack = Meteor.call("decorateTrack", user, track)
    Playlists.update({_id: playlist._id}, {$set: {['songlist.track_'+decoratedTrack.spotifyId]: decoratedTrack}})
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

  "playlist.fetchFromUserId": function(user){
    updateTokenWrapper(user)
    url = config.playlistUrl(user._id)
    headers = {'Authorization': 'Bearer ' + user.token.accessToken }
    result = getApiWrapper(url, headers)
    if(result.body.error){
      return false
    }else{
      LoggedUsers.update({_id: user._id}, {$set: {"playlists": result.body.items}})
      result.body.items.map(function(playlist){
        if(Playlists.findOne({_id: playlist.id})){
          // Playlist already exists
        }else if(playlist.owner.id !== user._id){
          // Playlist is not user's so it cannot be modified, so it won't be listed
        }else{
          cleanName = playlist.name.replace(/ /g,"_")
          sameNameSize = Playlists.find({chosenName: cleanName}).fetch().length
          if(sameNameSize > 0){
            urlParam = cleanName + "_" + sameNameSize
          }else{
            urlParam = cleanName
          }
          newPlaylist = {
            _id: playlist.id,
            spotifyUrl: playlist.href,
            name: playlist.name,
            chosenName: urlParam,
            userId: user._id,
            songlist: {},
            tracks: {},
            creatorId: playlist.owner.id,
            openUrl: playlist.external_urls.spotify,
          }
          Playlists.insert(newPlaylist)
        }
      })
    }
  },
})
