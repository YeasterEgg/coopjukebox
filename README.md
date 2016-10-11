# Democracy-Jockey
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
The poll will have 3 main features: playlist length, duration of the vote and polling size.
{polling_size} tracks from the Songlist will be randomly chosen to be inserted into a poll, that for all of the duration will be voted by anyone who goes to its url. At the end of the poll, the song with more votes will be added to the playlist. That will be repeated, with different random songs, for as many times as the length of the playlist.

TO BE FUCKING DONE!

- Export current songlist as array of uris
- Import arrays of uris as songlists :D
- Retrieve track special data (danceability, etc.)
- Move poll duration and playlist length (or, better, number of polls) to poll manager
