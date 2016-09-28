querystring = require('querystring')
request = require('request')

const clientId = "7c5e5454fa984628b185a254e6de4331"
const clientSecret = "60931e45084d44349b6b6f63c8aa5760"
const redirectUri = "http://localhost:3000/"

const scope = "user-read-private user-read-email"

const authUrl = "https://accounts.spotify.com/authorize"
const tokenUrl = "https://accounts.spotify.com/api/token"

const playlistUrl = "https://api.spotify.com/v1/me/playlists"

returnParams = function(url){
  query = url.split("?")[1]
  queryParams = {}
  if(query){
    params = query.split("&")
    params.map(function(param){
      key = param.split("=")[0]
      value = param.split("=")[1]
      queryParams[key] = value
    })
  }
  return queryParams
}

getAuth = function(sessionId){
  params = {
            client_id: clientId,
            response_type: "code",
            redirect_uri: redirectUri,
            scope: scope,
            state: sessionId
          }
  redirectUrl = authUrl + "?" + querystring.stringify(params)
  return redirectUrl
}

getToken = function(code, infoUrl, callbackFunction){
  authOptions = {
                  url: tokenUrl,
                  form: {
                    code: code,
                    redirect_uri: redirectUri,
                    grant_type: 'authorization_code'
                  },
                  headers: {
                    'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64'))
                  },
                  json: true
                }
  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callbackFunction(body)
    }
  })
}

module.exports = {
  returnParams: returnParams,
  getAuth: getAuth,
  getToken: getToken
}
