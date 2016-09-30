import { Mongo } from 'meteor/mongo';

export const Playlists = new Mongo.Collection('playlists');

if (Meteor.isServer) {
  Meteor.publish('Playlists', function playlistsPublication() {
    return Playlists.find();
  });
}
