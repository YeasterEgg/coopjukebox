getTrackValues = function(track){
  cleanTrack = {}
  cleanTrack.name = track.name
  cleanTrack.artist = track.artists[0].name
  cleanTrack.album = track.album.name
  cleanTrack.duration_ms = track.duration_ms
  cleanTrack.spotifyId = track.id
  cleanTrack.previewUrl = track.preview_url
  cleanTrack.votes = 0
  return cleanTrack
}

randomProperties = function(object, size){
  keys = Object.keys(object)
  randomKeys = _.sample(keys, size)
  result = _.pick(object, randomKeys)
  return result
}

module.exports = {
  getTrackValues: getTrackValues,
  randomProperties: randomProperties,
}
