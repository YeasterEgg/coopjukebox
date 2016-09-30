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

getAuth = function(clientId, redirectUri, scope, sessionId, authUrl){
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

module.exports = {
  returnParams: returnParams,
  getAuth: getAuth,
}
