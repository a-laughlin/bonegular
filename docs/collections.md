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