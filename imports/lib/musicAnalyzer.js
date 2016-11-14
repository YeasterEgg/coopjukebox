clusterizeTracks = function(tracks){
  minPaw = _.min(tracks, _.property('pawa'))
  maxPaw = _.max(tracks, _.property('pawa'))
  minStr = _.min(tracks, _.property('strength'))
  maxStr = _.max(tracks, _.property('strength'))
  // TO BE DONE YET!
}

mergeFeatures = function(track, maxTempo = 1000, minTempo = 1, minLoudness = 0, maxLoudness = -60){
  if(!track.features || maxTempo === minTempo){
    return track
  }else{
    track.pawa = track.features.energy * ((track.features.danceability + track.features.valence ) / 2)
    // Values can go from 0 to 1, energy is rated more than valence and danceability
    normalizedTempo =  (track.features.tempo - minTempo) / (maxTempo - minTempo)
    normalizedLoudness = (track.features.loudness - minLoudness) / (maxLoudness - minLoudness)
    track.strength = normalizedTempo * normalizedLoudness
    // Values can go from 0 to 1
    return track
  }
}

module.exports = {
  clusterizeTracks: clusterizeTracks,
  mergeFeatures: mergeFeatures,
}
