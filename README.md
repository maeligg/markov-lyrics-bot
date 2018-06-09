# Markov Lyrics Bot

This bot uses the https://genius.com/ API to retrieve songs from an artist and generate new lyrics from Markov chains.

## Installation

To test the bot locally, uncomment the config import in index.js. You will also need to add a config.js file at the root the directory, using the following template :

```
module.exports = {
  artist_id:           'XXX',
	GENIUS_ACCESS_TOKEN: 'XXX',
	consumer_key:        'XXX',
	consumer_secret:     'XXX',
	access_token:        'XXX',
	access_token_secret: 'XXX'
}
```

Fill in each section with your own keys/tokens (the last four are for the Twitter API).
For more information on the Twitter API, visit https://apps.twitter.com/app/new
You will need to register an API key at https://genius.com/developers to use the bot. To find the ID of your artist in the Genius API, search for their name at https://docs.genius.com/#search-h2
