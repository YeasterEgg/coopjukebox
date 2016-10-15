const clientId = "7c5e5454fa984628b185a254e6de4331"
const clientSecret = "60931e45084d44349b6b6f63c8aa5760"
const scope = "user-read-private user-read-email playlist-modify playlist-modify-private"

const redirectUrl = Meteor.absoluteUrl() + "callback"
const authUrl = "https://accounts.spotify.com/authorize"
const tokenUrl = "https://accounts.spotify.com/api/token"
const userUrl = "https://api.spotify.com/v1/me/"
const searchUrl = "https://api.spotify.com/v1/search?"
const embeddedTrackUrl = "https://embed.spotify.com/?uri=spotify:track:"
const trackFeaturesUrl = "https://api.spotify.com/v1/audio-features/"
const playlistUrl = function(userSpotifyId){
  return ("https://api.spotify.com/v1/users/" + userSpotifyId + "/playlists")
}
const playlistTracksUrl = function(userSpotifyId, playlistSpotifyId){
  return ("https://api.spotify.com/v1/users/" + userSpotifyId + "/playlists/" + playlistSpotifyId + "/tracks?limit=100")
}
const playlistAddTrack = function(userSpotifyId, playlistSpotifyId){
  return ("https://api.spotify.com/v1/users/" + userSpotifyId + "/playlists/" + playlistSpotifyId + "/tracks"
)
}
const punishmentUris = [
  "spotify:track:6xfs3g7UCu1BJlAnQ13gT3", // Gigi d'Alessio
  "spotify:track:7k04AtkrExPKYGrWXCuSzB", // Pippo Franco
]

module.exports = {
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUrl: redirectUrl,
  scope: scope,
  authUrl: authUrl,
  tokenUrl: tokenUrl,
  userUrl: userUrl,
  playlistUrl: playlistUrl,
  playlistTracksUrl: playlistTracksUrl,
  searchUrl: searchUrl,
  punishmentUris: punishmentUris,
  playlistAddTrack: playlistAddTrack,
  embeddedTrackUrl: embeddedTrackUrl,
  trackFeaturesUrl: trackFeaturesUrl,
}
