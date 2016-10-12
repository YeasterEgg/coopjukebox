import { LoggedUsers } from '../imports/api/loggedUsers.js'

getAuth = function(clientId, redirectUrl, scope, sessionId, authUrl){
  params = {
            client_id: clientId,
            response_type: "code",
            redirect_uri: redirectUrl,
            scope: scope,
            state: sessionId
          }
  redirectUrl = authUrl + "?" + querystring.stringify(params)
  return redirectUrl
}

getTokenFromUser = function(userId){
  user = LoggedUsers.findOne({_id: userId})
  if(user){
    accessToken = user.token.accessToken
    return accessToken
  }else{
    return false
  }
}

updateToken = function(user, callback){
  token = user.token
  expiringDate = new Date(token.validationStart.getTime() + token.expiresIn * 1000)
  now = new Date
  if(expiringDate < now){
    url = config.tokenUrl
    form = {
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken,
          }
    headers = { 'Authorization': 'Basic ' + (new Buffer(config.clientId + ':' + config.clientSecret).toString('base64')) }
    newTokenResponse = postApiWrapper(url, headers, form)
    token = {
              accessToken: newTokenResponse.body.access_token,
              tokenType: newTokenResponse.body.token_type,
              expiresIn: newTokenResponse.body.expires_in,
              refreshToken: token.refreshToken,
              scope: newTokenResponse.body.scope,
              validationStart: now,
            }
    LoggedUsers.update({_id: user._id}, {$set: {token: token } }, callback)
  }else{
    callback()
  }
}
