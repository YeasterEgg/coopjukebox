# Coop-Jukebox
Polls for choosing a song in a Spotify playlist

HOW IT SHOULD WORK:

I, User, go to root page and defer all my rights as human being to my poweful app.
There I will be able to:
- Create a Spotify Playlist
- Choose an already created Spotify Playlist

Then everything will focus on to the Playlist I've chosen, and I will be able to create a Songlist.
That will be possible through 3 different ways:
1 - Choose a song from the search engine
2 - Import a Spotify Playlist via its Uri, Url or Id
3 - Import a previously exported Songlist

Then, and only then, I will be able to start a poll!
First, I will have to choose a NOT IN USE poll name, so that the voters will be able to express their choice @ {ROOT_URL}/:poll_name.
The poll will have 2 main features: playlist length and polling size.
There will be L (playlist length) polls, and for each of them the poll will offer N (polling size) tracks, which will be chosen from 2 different sources: one is the songlist, the other is a songlist created by voters. The app will chose up to N/2 (rounded to excess) from the voters' songlist, if there are enough songs, and the rest will come from the user songlist.
The poll will last for as long as the previous poll's winner song, or, if it's the first, for 5 minutes.
At the end of the poll, the song with more votes will be added to the playlist.

TO BE FUCKING DONE!

- Export and Import Songlist with the playlist id
- Show available polls in homepage
- Allow to set a poll as private
