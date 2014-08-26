var express = require('express'),
    app = express(),
    fs = require('fs'),
    browserify = require('browserify');

app.use('/build', express.static(__dirname + '/build'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/', express.static(__dirname + '/example'));

app.get('/app.js', function(req, res) {
    res.set({
        'Content-Type': 'application/javascript'
    });
    var b = browserify();
    b.add(__dirname + '/src/index.js');
    b.bundle().pipe(res);
});

app.get('/countries', function(req, res) {
    res.send(require('./lib/country.json').data);
});

app.put('/countries/:country_id/states/:state_id', function(req, res) {
    res.send(req.body);
});

app.put('/countries/:country_id/states/:state_id/capitol', function(req, res) {
    res.send(req.body);
});

app.get('/countries/:country_id/states/:state_id/people', function(req, res) {
    res.send([
        {
            'id': 1,
            'first_name': 'Tim',
            'favorite_foods': {
                'candy': [
                    'twizzlers', 'snickers'
                ],
                'vegetables': [
                    'spinach', 'carrots'
                ]
            }
        },
        {
            'id': 2,
            'first_name': 'Laura'
        }
    ]);
});

app.get('/people', function(req, res) {
    res.send([
        {
            'id': 3,
            'first_name': 'Wilhelm'
        },
        {
            'id': 4,
            'first_name': 'Albert'
        }
    ]);
});

module.exports = app;
