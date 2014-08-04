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
	'methods': {}
});
```

