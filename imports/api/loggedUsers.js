import { Mongo } from 'meteor/mongo';

export const LoggedUsers = new Mongo.Collection('loggedUsers');

if (Meteor.isServer) {
  Meteor.publish('loggedUsers', function loggedUsersPublication() {
    return LoggedUsers.find();
  });
}

Meteor.methods({
  'loggedUsers.fromSessionId': function(sessionId){
      currentUser = LoggedUsers.findOne({sessionId: sessionId})
      if(currentUser){
        return {userId: currentUser._id, playlists: currentUser.playlists}
      }else{
        return {userId: false, playlists: []}
      }
  },

  "loggedUsers.findOrCreate": function(code, sessionId){
    tokenUrl = config.tokenUrl
    tokenHeaders = {'Authorization': 'Basic ' + (new Buffer(config.clientId + ':' + config.clientSecret).toString('base64'))}
    form = {
            code: code,
            redirect_uri: config.redirectUrl,
            grant_type: 'authorization_code'
          }
    getToken = postApiWrapper(tokenUrl, tokenHeaders, form)

    userUrl = config.userUrl
    userHeaders = { 'Authorization': 'Bearer ' + getToken.body.access_token }
    getUserData = getApiWrapper(userUrl, userHeaders)

    if(getUserData.body.error) return false

    token = {
        accessToken: getToken.body.access_token,
        tokenType: getToken.body.token_type,
        expiresIn: getToken.body.expires_in,
        refreshToken: getToken.body.refresh_token,
        scope: getToken.body.scope,
        validationStart: new Date,
      }

    existantUser = LoggedUsers.findOne({_id: getUserData.body.id})

    if(existantUser){
      LoggedUsers.update({_id: getUserData.body.id}, {$set: {sessionId: sessionId, token: token}})
    }else{
      LoggedUsers.insert({
        _id: getUserData.body.id,
        name: getUserData.body.display_name,
        email: getUserData.body.email,
        uri: getUserData.body.uri,
        sessionId: sessionId,
        playlists: [],
        token: token,
        createdAt: new Date,
      })
    }
    return getUserData.body.id
  },

  "loggedUsers.addPlaylist": function(userId, playlist){
    user = LoggedUsers.findOne({_id: userId})
    url = config.playlistUrl(userId)
    headers = {'Authorization': 'Bearer ' + user.token.accessToken },
    form = JSON.stringify(_.pick(playlist, ['name', 'public']))
    result = postApiWrapper(url, headers, form)
    if(result.body.error && result.body.error.status === 401){
      // {error: { status: 401, message: 'The access token expired' }}
      updateToken(user._id)
      Meteor.call('loggedUsers.addPlaylist', userId, playlist)
    }
    playlist["spotifyId"] = result.body.id
    playlist["spotifyUrl"] = result.body.external_urls.spotify

    return true
  },

})

