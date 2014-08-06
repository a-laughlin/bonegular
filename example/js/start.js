app = angular.module('myApp', [
    'bonegular'
]);

app.controller('DefaultController', function($scope, Countries, People) {

    var countries = new Countries();
    $scope.countries = countries.models;
    countries.get().then(function() {

        console.log('Countries were fetched.', countries);

        var usa = countries.findWhere({
            'name': 'United States'
        });

        console.log('usa', usa);

        var tn = usa.states.findWhere({
            'name': 'Tennessee'
        });

        console.log('tn', tn);

        console.log('tn parent', tn.parent());

        tn.save().then(function() {
            console.log('tn saved');
        }, function(err) {
            console.log(err);
        });

        tn.people.get().then(function() {
            console.log('tn.people', tn.people);
        }, function(err) {
            console.log(err);
        });

    });

    var people = new People();
    people.get().then(function() {
        console.log('people', people);
    }, function(err) {
        console.log(err);
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
        'methods': {}
    });
});

app.factory('State', function(bonegular, People) {
    return bonegular.createModel({
        'methods': {
            'describe': function() {
                alert(this.name + ' is awesome.');
            }
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
        'methods': {}
    });

});
