# Bonegular <a name="introduction"></a>

### Backbone-Inspired Models and Collections for Angular

<img style="float: right; width: 125px; margin-left: 20px;" src="https://dl.dropboxusercontent.com/u/832215/bonegular.png" />

[AngularJS](https://angularjs.org) is a fantastic client-side framework. It solves a lot of problems, but provides little to no guidance in terms of how one might best go about structuring the underlying data of an application. I tried [$resource](https://docs.angularjs.org/api/ngResource/service/$resource) and [Restangular](https://github.com/mgonto/restangular), but they weren't really "doing it for me." I found myself longing for something more akin to the Collection and Model classes that you find in [Backbone](http://backbonejs.org). Click, click. Tap, tap. Voila... Bonegular. Makes perfect sense.

This is an alpha release. The API could change a little, but I'm already using this in production and it works great.

* [Introduction](#introduction)
* [Examples](#examples)
	* [Models](/docs/models.md)
	* [Collections](/docs/collections.md)
* [Dependencies](#deps)
* [Installation](#installation)
* [See a Live Example](#example)
* [License](#license)

# Examples <a name="examples"></a>

Bonegular works well with a number of back-end storage solutions, including traditional "relational" databases (e.g. MySQL, PostgreSQL) and so-called "NoSQL" document stores (e.g. MongoDB, CouchDB):

* [Document Stores (MongoDB)](#document)

## MongoDB <a name="document"></a>

### Back-end Data

In this example, let's assume that your application's data resides within one or more MongoDB "collections." These collections likely contain one or more nested "sub-documents," as shown in the following example schema:

```
var School = {
	'name': {
		'type': String
	},
	'students': [
        {
	        'first_name': {
		        'type': String
	        },
	        'last_name': {
		        'type': String
	        }
        }
	]
};
```

As you can see, we have one primary document here - ```School```. Beneath this document's ```students``` key, lives an array of sub-documents representing students. Let's assume that our application provides REST endpoints to the ```School``` resource as shown below:

```
GET: /api/schools - Returns all schools.
POST: /api/schools - Creates a new school.
GET: /api/schools/:school_id - Returns a specific school.
GET: /api/schools/:school_id/students - Returns the students for a specific school.
POST: /api/schools/:school_id/students - Creates a new student within a specific school.
```

### Configuring Bonegular

To model this within Bonegular, we'll want to create two collections (Schools, Students) and two models (School, Student). A relationship exists between schools and students (students belong to schools). Notice how in the following examples we define these objects within reusable Angular "services."

#### The "School" Model
```
app.factory('School', function(bonegular, Students) {
    return bonegular.createModel({
    	'collections': {
    		'students': Students
    	},
		'methods': {}
    });
});
```

#### The "Student" Model
```
app.factory('Student', function(bonegular) {
    return bonegular.createModel({
		'methods': {}
    });
});
```

#### The "Schools" Collection
```
app.factory('Schools', function(School, bonegular) {
	return bonegular.createCollection({
	    'model': School,
		'url': '/api/schools',
		'methods': {}
	});
});
```

#### The "Students" Collection
```
app.factory('Students', function(Student, bonegular) {
	return bonegular.createCollection({
	    'model': Student,
		'url': 'students',
		'methods': {}
	});
});
```

### Using Them

Now that we've defined our models and collections, we can use them:


```
app.controller('DefaultController', function($scope, Schools) {

	var schools = new Schools();

	/**
	 * Executes a GET against /api/schools
	 */
	schools.get().then(function() {

		// Loop through our students collection.
		schools.students.each(function(student) {
		});

		// Executes a POST against /api/schools/:school_id/students
		schools.students.create({
			'first_name': 'John',
			'last_name': 'Doe'
		}).then(function(student) {
			// Our new student was created.
		});

	});

});
```

### Shared Models / Collections

A common use case involves having a model or collection instance that you would like to share across multiple areas of your app. The following example illustrates how you can do that:

```
/**
 * The `schools` service returns an *instance* of the `Schools` class. Any portion of your app
 * that references this service will be referencing the same instance.
 */
app.factory('schools', function(Schools) {
	var schools = new Schools();
	return schools.get();
});
```
## Dependencies <a name="deps"></a>

* [Lo-Dash](http://lodash.com)
* [Lo-Dash-Deep](https://github.com/marklagendijk/lodash-deep)

## Installation <a name="installation"></a>

```
$ bower install bonegular --save
```

# See a Live Example <a name="example"></a>

* Clone this project.
* Install dependencies: ```$ npm install; bower install```
* Launch the example: ```$ grunt serve```

# License (MIT) <a name="license"></a>

```
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
