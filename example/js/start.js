app = angular.module('myApp', [
    'bonegular'
]);

app.controller('DefaultController', function($scope, Countries, EuropeanCountries, People) {

    var europeanCountries = new EuropeanCountries();
    europeanCountries.fetch().then(function() {
        europeanCountries.something();
    }, function(err) {
        console.log(err);
    });

    var people = new People();

    people.fetch().then(function() {
        console.log('people', people);
        console.log('people.length', people.length);
    }, function(err) {
        console.log(err);
    });

    var countries = new Countries();
    $scope.countries = countries.models;
    countries.fetch().then(function() {

        console.log('Countries were fetched.', countries);

        var clonedCountries = countries.clone();
        console.log('clonedCountries', clonedCountries);

        var usa = countries.findWhere({
            'name': 'United States'
        });

        console.log('usa', usa);
        console.log('states', usa.states);

        var westernStates = usa.states.createFilter('western', function(state) {
            if (state.name !== 'Tennessee') {
                return true;
            }
        });

        var southernStates = usa.states.createFilter('southern', {
            'name': 'Tennessee'
        });

        console.log('westernStates', westernStates);
        console.log('southernStates', southernStates);

        var tn = usa.states.findWhere({
            'name': 'Tennessee'
        });

        console.log('tn', tn);

        console.log('tn parent', tn.parent());

        console.log('tn capitol', tn.capitol);
        console.log('tn capitol population', tn.capitol.population);

        tn.save().then(function() {
            console.log('tn saved');
        }, function(err) {
            console.log(err);
        });

        tn.capitol.save().then(function() {
            console.log('capitol saved');
        }, function(err) {
            console.log('capitol save error', err);
        });

        tn.people.fetch().then(function() {

            console.log('tn.people', tn.people);

            var tim = tn.people.id(1);
            console.log('tim', tim);
            console.log('candy', tim.get('favorite_foods.candy'));

        }, function(err) {
            console.log(err);
        });

    });

});

/**
 * @service Country
 */
app.factory('Country', function(bonegular, States) {
    return bonegular.createModel({
        'id_attribute': 'id',
        'collections': {
            'states': States
        },
        'methods': {}
    });
});

/**
 * @service Countries
 */
app.factory('Countries', function(bonegular, Country) {
    return bonegular.createCollection({
        'model': Country,
        'rootUrl': '/countries',
        'methods': {
            'something': function() {
                console.log('something', this);
            }
        }
    });
});

app.factory('EuropeanCountries', function(Countries) {
    return Countries.extend({
        'rootUrl': '/european-countries'
    });
});

app.factory('State', function(bonegular, People, Capitol) {

    return bonegular.createModel({
        'methods': {
            'describe': function() {
                alert(this.name + ' is awesome.');
            }
        },
        'virtuals': {
            'capitol': {
                'get': function() {
                    return this._capitol;
                },
                'set': function(capitol) {
                    this._capitol = new Capitol(capitol, this);
                }
            },
        },
        'collections': {
            'people': People
        }
    });

});

app.factory('States', function(bonegular, State) {

    return bonegular.createCollection({
        'model': State,
        'url': 'states',
        'methods': {}
    });

});

app.factory('People', function(bonegular, Person) {

    return bonegular.createCollection({
        'model': Person,
        'rootUrl': '/people',
        'url': 'people'
    });

});

app.factory('Person', function(bonegular) {

    return bonegular.createModel({
        'id_attribute': 'id',
        'methods': {
        }
    });

});

app.factory('Capitol', function(bonegular) {

    return bonegular.createModel({
        'id_attribute': 'id',
        'methods': {},
        'rootUrl': '/capitols'
    });

});
