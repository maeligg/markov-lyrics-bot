const Twit = require('twit');
const Lyricist = require('lyricist/node6');
const MarkovChain = require('markovchain');

// Uncomment these 2 lines if running locally (see readme for more details)
// const config = require('./config.js');
// process.env = config;

const T = new Twit({
	consumer_key: process.env.consumer_key,
	consumer_secret: process.env.consumer_secret,
	access_token: process.env.access_token,
	access_token_secret: process.env.access_token_secret
});

const lyricist = new Lyricist(process.env.GENIUS_ACCESS_TOKEN);

const getLyrics = async () => {
	let allLyrics = '';

	// Set your artist ID as an environment variable.
	// Make a first call to retrieve the first 50 songs of the artist
	const songList = await lyricist.songsByArtist(process.env.artist_id, {
		page: 1,
		perPage: 50
	});

	// For each song, we have to scrape the lyrics (as they are not available through the API)
	const songs = await Promise.all(
		Array.from(songList)
			.map(song => {
				return lyricist.song(song.id, { fetchLyrics: true }).catch(() => {
					return false;
				});
			})
			// Filter out rejected promises
			// @TODO improve the way rejected promises are handled
			.filter(song => {
				if (!!song) {
					return song;
				}
			})
	);

	// For convenience, we add lyrics from all the songs into a single string
	Array.from(songs).forEach(song => {
		const songArray = song.lyrics.split('\n');
		songArray.forEach(songLine => {
			if (songLine && songLine[0] !== '[') {
				allLyrics += songLine + '\n';
			}
		});
	});

	generateMarkov(allLyrics);
	// Generate new lyrics and tweet every 3 hours
	setInterval(() => {
		generateMarkov(allLyrics);
	}, 1000 * 60 * 60 * 3);
};

const generateMarkov = string => {
	const markov = new MarkovChain(string);

	let newLyrics = markov.end(30).process(); // Set the word limit to 30
	// If the new lyrics are too short or are over Twitter's 280 characters limit, we just generate some new ones
	if (newLyrics.length < 20 || newLyrics.length > 280) {
		generateMarkov(string);
	}

	// Prettify the output
	newLyrics = newLyrics.charAt(0).toUpperCase() + newLyrics.slice(1);
	newLyrics = newLyrics.replace(/([,!] )(\w)/g, (match, $1, $2) => {
		return $1 + '\n' + $2.toUpperCase();
	});

	postTweet(newLyrics);
};

// Publish the tweet
const postTweet = tweetContent => {
	T.post('statuses/update', { status: tweetContent }, (err, data, resp) => {
		if (err) {
			console.log('error: ', err);
		} else {
			console.log('response: ', resp);
		}
	});
};

getLyrics();
