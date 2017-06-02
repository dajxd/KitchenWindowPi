var express = require('express');
var router = express.Router();
var cronofy = require('cronofy');
var NYT = require('nyt');

////// CREATE FOOTBALL NEWS //////

//access token b4056302228c9ab6ceb1dcfe2feff400
/*App Name
 decentzebra
 Client Id
 20351438074025bc37d380adc5427af6
 Client Secret
 6972410b4fa219b58bbb57b20e64c5bbb4265411681a60ca7755c9b8cf08706f*/   //is this the end of client secret? 206752

var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

// function turnIntoAbb(titles){
//     var hashtags = [];
//     var indx = 0;
//     while  (indx < 3) {
//         var re = new RegExp(/\w+\w\s/);
//         var chunk1 = re.exec(titles[indx])[0].slice(0, -1);
//         re = new RegExp(/vs\s\w+/);
//         var chunk2 = re.exec(titles[indx])[0].slice(3);
//         var chunk1abb = TeamAbbr[chunk1];
//         var chunk2abb = TeamAbbr[chunk2];
//         var hashtag = chunk1abb + "vs" + chunk2abb;
//         indx += 1;
//         hashtags.push(hashtag)
//     }
//     getAndStore(res, hashtags)
// }


FootballGame = function(title, score){
    this.title = title;
    this.score = score
};
function httpGetAsync(req, res, next) {

}


////// CREATE ALLNEWS //////
var keys = {'newswire':'fc93705663d844ecbb7804719f0739d7'};
var nyt = new NYT(keys);
NewsObj = function(section, title, abstract){
    this.section = section;
    this.title = title;
    this.abstract = abstract;
};
function inArray(needle,haystack) {
    var count = haystack.length;
    for (var i = 0; i < count; i++) {
        if (haystack[i] == needle) {
            return false;
        }
    }
    return true;
}
var allnews = [];
function parseNews(news){
    var unwantedsections = ['Movies', 'Fashion & Style', 'Briefing', 'Real Estate', 'Arts'];
    pnews = JSON.parse(news);
    var i = 0;
    while (1===1) {
        if (inArray(pnews.results[i].section, unwantedsections)){
            newnews = new NewsObj(pnews.results[i].section, pnews.results[i].title, pnews.results[i].abstract);
            allnews.push(newnews);
            console.log(allnews.length);
            if (allnews.length > 2){
                break
            }
        }
        else {
            console.log('nope')}
        i++
    }
    console.log(allnews)
}
nyt.newswire.recent({'section':'all'}, parseNews);

//////CREATE EVENTSTODAY FROM ICAL#///////
function convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
    // var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();
    newDate.setHours(hours);// - offset);
    return newDate;
}
today = new Date();
month = String(today.getMonth()+1);
if (month.length < 2){
    month = "0" + month
}
day = String(today.getDate());
if (day.length < 2){
    day = "0" + day
}
year = String(today.getFullYear());
UTCdate = year + "-" + month + "-" + day;
var tomorrow = new Date();
tomorrow.setDate(today.getDate()+2);
todaystring = today.toISOString();
tomorrowstring = tomorrow.toISOString();
console.log(todaystring, tomorrowstring);
var eventoptions = {
    from: todaystring,
    to: tomorrowstring,
    access_token: 'DJIcrpXt4RfW81QtTlfj1taHqt5lASM1',
    tzid: 'America/New_York'

};
function EventConstructor (start, summary){
    this.start = start;
    this.summary = summary
}
eventstoday = [];
cronofy.readEvents(eventoptions).then(function (response) {

    var events = response.events;
    for (var thing in events){

        var rawdate = String(events[thing].start);
        rawdate = String(convertUTCDateToLocalDate(new Date(rawdate)));
        var comparisondate = rawdate.slice(0,10);
        var displaydate = rawdate.slice(16,21);

        if (parseInt(displaydate.slice(0,2)) > 12){
            var hour = displaydate.slice(0,2);
            var minute = displaydate.slice(2);
            hour -= 12;
            displaydate = hour + minute
        }
        event = new EventConstructor(displaydate, events[thing].summary);
        eventstoday.push(event)

    }
    console.log(eventstoday)
});


/* GET home page. */
router.get('/', function(req, res, next) {
    var allgames = [];
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            var data = JSON.parse(xmlHttp.responseText);
            for (var bit in data.games) {
                game = new FootballGame(data.games[bit].title, data.games[bit].score);
                allgames.push(game)
            }
            //TODO: start all of the other stuff here so that it triggers when the page reloads
            res.render('index', { title: 'KitchenWindow', events: eventstoday, news: allnews, games: allgames});
        }
    };
    xmlHttp.open("GET", 'https://api.stattleship.com/football/nfl/games?status=ended', true); // true for asynchronous
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.setRequestHeader('Accept', 'application/vnd.stattleship.com; version=1');
    xmlHttp.setRequestHeader('Authorization', 'Token token=b4056302228c9ab6ceb1dcfe2feff400');
    xmlHttp.send(null);
});

module.exports = router;
