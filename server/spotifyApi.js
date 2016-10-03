getApi = function(url, headers, callback){
  options = {
    url: url,
    headers: headers,
    json: true
  };
  request.get(options, callback)
}

postApi = function(url, headers, form, callback){
  options = {
    url: url,
    headers: headers,
    form: form,
    json: true
  };
  request.post(options, callback)
}
