app = angular.module('myApp', [
    'bonegular'
]);

app.controller('DefaultController', function($scope, Countries) {

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

app.factory('State', function(bonegular) {
    return bonegular.createModel({
        'methods': {
            'describe': function() {
                alert(this.name + ' is awesome.');
            }
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
