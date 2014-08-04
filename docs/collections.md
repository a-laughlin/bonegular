# Collections

## Defining a Collection

The following example demonstrates how a Bonegular collection is created. Note the fact that this collection is being defined with an Angular factory. As a result, scopes can access this collection by referencing the `Countries` dependency.

```
app.factory('Countries', function(bonegular, Country) {

	return bonegular.createCollection({
		'model': Country,
		'rootUrl': '/api/countries',
		'methods': {}
	});

});
```

## Retrieving the Contents of a Collection

```
app.controller('MyController', function($scope, Countries) {

	var countries = new Countries();
	countries.get().then(function() {
		// The collection has been retrieved.
	}, function(err) {
		// An error occurred.
	});
	
	/**
	 * You don't have to wait for the call to `get` to finish
	 * before assigning a reference to the collection's models to
	 * $scope. The collection's reference to `models` will be updated
	 * once data is returned.
	 */
	$scope.countries = countries.models;

});
```

## Creating a new Collection Member

The following example will result in a `POST` call being made to the `/api/countries` endpoint. Once the new instance of `Country` has been created, it is automatically added to the `countries` collection instance.

```
countries.create({
	'name': 'New Zealand'
}).then(function(country) {
	// `country` has been added to the collection.
	// console.log(countries.models.indexOf(country)
}, function(err) {
	// An error occurred.
});
```

## Destroying a Collection Member

Destroying a member of a collection is a simple matter of calling the desired member's `destroy` method. Once destroy, the instance is automatically removed from its parent collection.

```
var country = countries.findWhere({
	'name': 'New Zealand'
});
country.destroy().then(function() {
	// The country has been destroyed (sorry).
}, function(err) {
	// An error occurred.
});
```