var express = require('express'),
    app = express(),
    fs = require('fs'),
    browserify = require('browserify'),
    _ = require('underscore');

app.use('/build', express.static(__dirname + '/build'));
app.use('/docs', express.static(__dirname + '/docs'));
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

app.get('/european-countries', function(req, res) {
    var data = require('./lib/country.json').data;
    var result = _.filter(data, function(c) {
        if (c.id === 2) {
            return true;
        }
    });
    res.send(result);
});

app.put('/countries/:country_id/states/:state_id', function(req, res) {
    res.send(req.body);
});

app.put('/capitols/:capitol_id', function(req, res) {
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
