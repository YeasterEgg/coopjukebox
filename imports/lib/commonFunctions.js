getTrackValues = function(track){
  cleanTrack = {}
  cleanTrack.name = track.name
  cleanTrack.artist = track.artists[0].name
  cleanTrack.album = track.album.name
  cleanTrack.duration_ms = track.duration_ms
  cleanTrack.spotifyId = track.id
  cleanTrack.previewUrl = track.preview_url
  return cleanTrack
}

module.exports = {
  getTrackValues: getTrackValues,
}
