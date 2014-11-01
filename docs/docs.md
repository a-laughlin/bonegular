AngularJS is a fantastic client-side framework. It solves a lot of problems, but provides little to no
guidance in terms of how one might best go about structuring the underlying data of an application. I
tried $resource and Restangular, but they weren't really "doing it for me." I found myself longing for
something more akin to the Collection and Model classes that you find in Backbone. Click, click. Tap,
tap. Voila... Bonegular. Makes perfect sense.

This is an alpha release. The API could change a little, but I'm already using this in production and
it works great.

## Model

### extend

New models are created via Bonegular's `createModel()` method.

```
app.factory('City', function(bonegular) {

    bonegular.createModel('City', {
        'methods': {
            'doSomething': function() {
                // ...
            }
        }
    });

});
```

### collection

### fetch

### destroy

### fetched

### parent

### createCollections

### setProperties

### get

### set

### toObject

### toJSON

### getId

### url

### rootUrl

### save

### patch

### setData

### virtuals

Bonegular models allow you to define "virtual" properties. In this example, a `formatted_coords`
virtual property is created, which can be accessed just like any other property, as shown below:

`console.log(instance.formatted_coords);`

```
app.factory('City', function(bonegular) {

    bonegular.createModel('City', {
        'virtuals': {
            'formatted_coords': function() {
                return this.lat + ', ' + this.lon;
            }
        }
    });

});
```

## Collection

### extend

```
app.factory('Cities', function(bonegular) {

    bonegular.createCollection('Cities', {
        'model': City
    });

});
```

### parent

### fetch

### create

### fetched

### setParent

### append

### push

### remove

### clone

### id

### filter

### pluck

### findWhere

### find

### where

### first

### last

### replace

### set

### replaceAll

### clear

### collectionize

### deCollectionize

### toObject

### toJSON

### each

### at

### url

### virtuals
