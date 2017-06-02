var express = require('express');
var router = express.Router();
var cronofy = require('cronofy');
var NYT = require('nyt');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

router.get('/', function(req, res, next) {
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
    tomorrow.setDate(today.getDate()+3);
    todaystring = today.toISOString();
    tomorrowstring = tomorrow.toISOString();
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
    function startCal() {
        cronofy.readEvents(eventoptions).then(function (response) {
            console.log('reading events');
            var events = response.events;
            // console.log(events);
            for (var thing in events) {

                var rawdate = String(events[thing].start);
                rawdate = String(convertUTCDateToLocalDate(new Date(rawdate)));
                var comparisondate = rawdate.slice(0, 10);
                var displaydate = rawdate.slice(16, 21);


                if (parseInt(displaydate.slice(0, 2)) > 12) {
                    var hour = displaydate.slice(0, 2);
                    var minute = displaydate.slice(2);
                    hour -= 12;
                    displaydate = hour + minute + "pm"
                }
                else {
                    displaydate += "am"
                }
                event = new EventConstructor(displaydate, events[thing].summary);
                eventstoday.push(event)

            }
            console.log('events done, rendering');
            // console.log("events today:");
            // console.log(eventstoday);
            res.render('index', { title: 'KitchenWindow', events: eventstoday, news: allnews, games: 'no'});
        });
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
        console.log('nyt success, parsing');
        var unwantedsections = ['Movies', 'Fashion & Style', 'Briefing', 'Real Estate', 'Arts'];
        try {
		pnews = JSON.parse(news);
	}
	catch(err) {
		console.log('E?????');
		console.log(err);
		pnews=[]; 
	}
        var i = 0;
        while (1===1) {
            if (inArray(pnews.results[i].section, unwantedsections)){
                newnews = new NewsObj(pnews.results[i].section, pnews.results[i].title, pnews.results[i].abstract);
                allnews.push(newnews);
                i++;
                if (allnews.length > 2){
                    break
                }
            }
            else {
                // console.log('nope')}
                i++
            }
        }
        // console.log(allnews);
        console.log('parse success, calling cal');
        startCal()
    }
    var startNews = function () {
        nyt.newswire.recent({'section': 'all'}, parseNews);
    };
    var allgames = [];
    var getXML = function () {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            //console.log('start fb xml');
            ///console.log(xmlHttp.status);
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                //console.log('fb xml success');
                //var data = JSON.parse(xmlHttp.responseText);
                //for (var bit in data.games) {
                //    game = new FootballGame(data.games[bit].title, data.games[bit].score);
                //    allgames.push(game)
                //}
                //TODO: start all of the other stuff here so that it triggers when the page reloads
                console.log('call news');
                startNews()
            }
        };
        console.log('get');
        xmlHttp.open("GET", 'https://api.stattleship.com/football/nfl/games?status=ended', true); // true for asynchronous
        xmlHttp.setRequestHeader('Content-Type', 'application/json');
        xmlHttp.setRequestHeader('Accept', 'application/vnd.stattleship.com; version=1');
        xmlHttp.setRequestHeader('Authorization', 'Token token=b4056302228c9ab6ceb1dcfe2feff400');
        xmlHttp.send(null);
    };
    // getXML()
    startNews()
});

module.exports = router;
