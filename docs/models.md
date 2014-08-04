# Models

## Defining a Model

The following example demonstrates how a Bonegular model is created. Note the fact that this model is being defined with an Angular factory. As a result, scopes can access this model by referencing the `Country` dependency.

```
app.factory('Country', function(bonegular) {

	return bonegular.createModel({
		'methods': {}
	});

});
```

## Specifying a Custom ID Property

By default, Bonegular models expect a unique identifier named `_id`. Models can be told to look at a different key for their unique identifier, as shown below:

```
var Country = bonegular.createModel({
	'id_attribute': 'id',
	'methods': {}
});
```

## Specifying a Root URL

In the first example, no value was specified for `rootUrl`. Why? In that example, the expectation was that `Country` would belong to a `Countries` collection, which *does* specify a value for `rootUrl`. To override this behavior, see the example below:

```
var Country = bonegular.createModel({
	'rootUrl': '/api/other_countries'
});
var country = new Country({
	'_id': 5
});
country.get().then(function() {
	// A `GET` call to `/api/other_countries/5` is created.
});
```