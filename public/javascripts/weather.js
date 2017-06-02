$(document).ready(function() {
    getWeather();
    setInterval(getWeather, 300000); //10 minutes
});

function getWeather() {
    $.simpleWeather({
        location: '12508',
        unit: 'f',
        success: function(weather) {
            html = '<h2>'+weather.temp+'&deg;'+weather.units.temp+'</h2>';
            html += '<ul><li>High: '+weather.high+'&deg;F</li>';
            html += '<li>Low: '+weather.low+'&deg;F</li></ul>';
            if (weather.currently == 'Sunny') {
                html += '<li class="currentlysunny">' + weather.currently + '</li>';
            }
            else {
                html += '<li class="currently">' + weather.currently + '</li>';
            }
            $("#weather").html(html);
        },
        error: function(error) {
            $("#weather").html('<p>'+error+'</p>');
        }
    });
}
