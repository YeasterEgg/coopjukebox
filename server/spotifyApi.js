getApi = function(url, headers, callback){
  options = {
    url: url,
    headers: headers,
    json: true
  };
  console.log(options)
  request.get(options, callback)
}

postApi = function(url, headers, form, callback){
  options = {
    url: url,
    headers: headers,
    form: form,
    json: true
  };
  console.log(options)
  request.post(options, callback)
}
