Meteor.methods({

  // Retrieves a logged user from the sessionId cached in localStorage.
  // Returns simply userId and playlist, no other informations.
  // IN  <- sessionId[string]
  // OUT <- {userId[or false], user.playlists[array]}

  'loggedUsers.fromSessionId': function(sessionId){
    currentUser = LoggedUsers.findOne({sessionId: sessionId})
    if(currentUser){
      return {userId: currentUser._id, playlists: currentUser.playlists}
    }else{
      return {userId: false, playlists: []}
    }
  },

  //
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
})
