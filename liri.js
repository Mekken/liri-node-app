require("dotenv").config();

let keys = require("./keys.js");
let request = require("request");
let Twitter = require("twitter");
let Spotify = require("node-spotify-api");
let fs = require("fs");

let spotify = new Spotify(keys.spotify);
let twitter = new Twitter(keys.twitter);
let command = process.argv[2];

function getTweets() {
    console.log("\nGrabbing Last 20 Tweets:");
    twitter.get('statuses/user_timeline',{count: 20},
    function(err,data) {
        if(err)
            console.log(err);
        else {
            console.log("Twitter Posts:");
            data.forEach(function(data,idx) {
                console.log(`Post #${idx+1}: ${data.text}`);
                appendToFile(`Post #${idx+1}: ${data.text}\n`);
            })
        }
    })
}

function getSongInfo(songName) {
    if(!songName)
        songName = "The Sign Ace of Base"

    console.log("Song Information: ");
    spotify.search({
        type: 'track',
        query: songName,
        limit: 1
    }, function(err,data) {
        if(err)
            console.log(err);
        else{
            let artistsStr = '',
                artistsArr = data.tracks.items[0].artists;
                albumName = data.tracks.items[0].album.name;
                previewURL = data.tracks.items[0].external_urls.spotify;
                songName = data.tracks.items[0].name;

            artistsArr.forEach(function(artist,idx ) {
                artistsStr += (artist.name + (idx < artistsArr.length-1 ? ',' : '')); 
            })

            console.log(`Artists: ${artistsStr}`);
            console.log(`Song Name: ${songName}`);
            console.log(`Preview Link: ${previewURL}`);
            console.log(`Album Name: ${albumName}`);

            appendToFile(`Artists: ${artistsStr}\n`);
            appendToFile(`Song Name: ${songName}\n`);
            appendToFile(`Preview Link: ${previewURL}\n`);
            appendToFile(`Album Name: ${albumName}\n`);
        }
    })
}

function getMovieInfo(movieName) {
    if(!movieName)
        movieName = "Mr.%20Nobody"
    
    titleQuery = movieName.replace(/\s+/g,'%20');
    request(`http://www.omdbapi.com/?t=${titleQuery}&apikey=trilogy`,function(err,response,body) {
        if(!err && response.statusCode === 200) {
            let data = JSON.parse(body);
            console.log("Move Information: ");
            console.log(`Title: ${data.Title}\nYear: ${data.Year}\nRating: ${data.imdbRating}\nRotten Tomatoes: ${data.Ratings[1].Value}\nCountry: ${data.Country}\nLanguage: ${data.Language}\nPlot: ${data.Plot}\nActors: ${data.Actors}`);

            appendToFile(`Title: ${data.Title}\nYear: ${data.Year}\nRating: ${data.imdbRating}\nRotten Tomatoes: ${data.Ratings[1].Value}\nCountry: ${data.Country}\nLanguage: ${data.Language}\nPlot: ${data.Plot}\nActors: ${data.Actors}`);
        } else {
            consoel.log(response);
            console.log(err);
        }
    })
}

function readFromFile()
{
    console.log("Reading from file....");
    fs.readFile('./random.txt','utf8',function(err,data) {
        var cmds = data.toString().split(',')
        checkCmd(cmds[0],cmds[1]);
    })
}

function appendToFile(str){
    fs.appendFile('log.txt',str,function(err) {
        if(err)
            console.log(err);
    })
}

function checkCmd(cmd,param) {
    switch(cmd) {
        case "my-tweets":
            getTweets();
            break;
        case "spotify-this-song":
            getSongInfo(param);
            break;
        case "movie-this":
            getMovieInfo(param);
            break;
        case "do-what-it-says":
            readFromFile();
            break;
    }
}

checkCmd(command,process.argv[3]);