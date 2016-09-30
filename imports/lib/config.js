const clientId = "7c5e5454fa984628b185a254e6de4331"
const clientSecret = "60931e45084d44349b6b6f63c8aa5760"
const redirectUri = "http://localhost:3000/"
const scope = "user-read-private user-read-email playlist-modify playlist-modify-private"
const authUrl = "https://accounts.spotify.com/authorize"
const tokenUrl = "https://accounts.spotify.com/api/token"


module.exports = {
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: redirectUri,
  scope: scope,
  authUrl: authUrl,
  tokenUrl: tokenUrl,
}
