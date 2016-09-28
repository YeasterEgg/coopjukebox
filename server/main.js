import { Meteor } from 'meteor/meteor';
import { Answers } from '../imports/api/answers.js';

var client_id = "7c5e5454fa984628b185a254e6de4331"; // Your client id
var client_secret = "60931e45084d44349b6b6f63c8aa5760"; // Your secret
var redirect_uri = "http://localhost:3000"; // Your redirect uri

Meteor.startup(() => {
});

Meteor.methods({
  "getAuth": function(){
    params = {
              client_id: client_id,
              response_type: "code",
              redirect_uri: redirect_uri,
            }
    result = Meteor.http.get("https://accounts.spotify.com/authorize", {params: params});
    Answers.insert({
      text: result.content
    })
    console.log(result)
  }.bind(this)
})
