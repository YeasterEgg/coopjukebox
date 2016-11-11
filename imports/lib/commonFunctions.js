getTrackValues = function(track){
  cleanTrack              = {}
  cleanTrack.name         = track.name
  cleanTrack.artist       = track.artists[0].name
  cleanTrack.album        = track.album.name
  cleanTrack.duration_ms  = track.duration_ms
  cleanTrack.spotifyId    = track.id
  cleanTrack.previewUrl   = track.preview_url
  cleanTrack.votes        = 0
  cleanTrack.score        = 100
  return cleanTrack
}

randomProperties = function(object, size){
  keys = Object.keys(object)
  randomKeys = _.sample(keys, size)
  result = _.pick(object, randomKeys)
  return result
}

secondsToMinutes = function(totalSeconds){
  seconds = totalSeconds % 60
  minutes = ~~(totalSeconds / 60)
  formatted = addLeadingZero(minutes) + ":" + addLeadingZero(seconds)
  return formatted
}

addLeadingZero = function(number){
  return ("0" + number).slice(-2)
}

module.exports = {
  getTrackValues: getTrackValues,
  randomProperties: randomProperties,
  secondsToMinutes: secondsToMinutes,
}
