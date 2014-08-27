(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/* global _ */

var bonegular = angular.module('bonegular', []);

bonegular.factory('bonegular', ['$http', '$q', function($http, $q) {

    var BaseCollection, BaseModel, createModel, createCollection, collections = {};

    BaseModel = require('./lib/model')($http, $q);
    BaseCollection = require('./lib/collection')($http, $q, collections);

    /**
     * Defines a new Model
     */
    createModel = function(options) {

        options.virtuals = options.virtuals || {};

        var Model = function() {

            Object.defineProperty(this, '_id_attribute', {
                'configurable': false,
                'writable': true,
                'enumerable': false,
                'value': options.id_attribute || '_id'
            });

            Object.defineProperty(this, '_fetched', {
                'configurable': false,
                'writable': true,
                'enumerable': false,
                'value': false
            });

            Object.defineProperty(this, '_cache', {
                'configurable': false,
                'writable': true,
                'enumerable': false,
                'value': options.cache || null
            });

            Object.defineProperty(this, '_parent', {
                'configurable': false,
                'writable': true,
                'enumerable': false,
                'value': null
            });

            Object.defineProperty(this, '_collection', {
                'configurable': false,
                'writable': true,
                'enumerable': false,
                'value': null
            });

            Object.defineProperty(this, '_rootUrl', {
                'configurable': false,
                'writable': true,
                'enumerable': false,
                'value': options.rootUrl || null
            });

            Object.defineProperty(this, '_url', {
                'configurable': false,
                'writable': false,
                'enumerable': false,
                'value': options.url || null
            });

            Object.defineProperty(this, '_collections', {
                'configurable': false,
                'writable': false,
                'enumerable': false,
                'value': options.collections || {}
            });

            Object.defineProperty(this, '_virtuals', {
                'configurable': false,
                'writable': false,
                'enumerable': false,
                'value': options.virtuals || {}
            });

            _.each(options.virtuals, function(virtual, name) {
                var options = {
                    'configurable': false,
                    'enumerable': true
                };
                if (_.isFunction(virtual)) {
                    virtual = {
                        'get': virtual
                    };
                }
                if (virtual['get'] && _.isFunction(virtual['get'])) {
                    options['get'] = virtual['get'];
                }
                if (virtual['set'] && _.isFunction(virtual['set'])) {
                    options['set'] = virtual['set']
                }
                Object.defineProperty(this, name, options);
            }, this);

            this._init.apply(this, arguments);

        };

        _.each(BaseModel, function(method, name) {
            Object.defineProperty(Model.prototype, name, {
                'configurable': false,
                'writable': false,
                'enumerable': false,
                'value': method
            });
        });

        _.each(options.methods, function(method, name) {
            Object.defineProperty(Model.prototype, name, {
                'configurable': false,
                'writable': false,
                'enumerable': false,
                'value': method
            });
        });

        return Model;

    };

    /**
     * Defines a new Collection
     */
    createCollection = function(options) {

        var Collection = function() {
            BaseCollection.apply(this, arguments);
        };

        Collection.prototype = new BaseCollection();
        Collection.prototype.constructor = Collection;

        var extendProto = function(proto, options) {
            if (options.url) {
                _.extend(proto, {
                    '_url': options.url
                });
            }

            if (options.rootUrl) {
                _.extend(proto, {
                    '_rootUrl': options.rootUrl
                });
            }

            if (options.cache) {
                _.extend(proto, {
                    '_cache': options.cache
                });
            }

            if (options.model) {
                _.extend(proto, {
                    '_model': options.model,
                    '_Model': options.model,
                    '_instance': new options.model()
                });
            }

            if (options.methods) {
                _.extend(proto, options.methods);
            }
        };

        extendProto(Collection.prototype, options);

        Collection.create = function() {
            var collection = new this;
            return collection.create.apply(collection, arguments);
        };

        Collection.extend = function(options) {
            var self = this;
            var ExtendedCollection = function() {
                self.apply(this, arguments);
            };
            ExtendedCollection.prototype = new self;
            ExtendedCollection.prototype.constructor = ExtendedCollection;
            extendProto(ExtendedCollection.prototype, options);
            return ExtendedCollection;
        };

        var collectionId = 'coll' + _.keys(collections).length;
        _.extend(Collection.prototype, {
            '_collection_id': collectionId
        });

        collections[collectionId] = Collection;

        return Collection;

    };

    return {

        'createModel': function(options) {
            return createModel(options);
        },

        'createCollection': function(options) {
            return createCollection(options);
        }

    };

}]);

},{"./lib/collection":2,"./lib/model":3}],2:[function(require,module,exports){
'use strict';
/* global _ */

module.exports = function($http, $q, collections) {

    var util = require('./util')($http, $q);

    function BaseCollection() {

        Object.defineProperty(this, '_fetched', {
            'configurable': false,
            'writable': true,
            'enumerable': false,
            'value': false
        });

        Object.defineProperty(this, '_filters', {
            'configurable': false,
            'writable': true,
            'enumerable': false,
            'value': {}
        });

        Object.defineProperty(this, 'models', {
            'configurable': false,
            'writable': true,
            'enumerable': true,
            'value': []
        });

        Object.defineProperty(this, '_parent', {
            'configurable': false,
            'writable': true,
            'enumerable': false,
            'value': null
        });

        this._init.apply(this, arguments);

    };

    _.extend(BaseCollection.prototype, {

        '_init': function(rows, parent) {
            if (_.isArray(rows)) {
                this._fetched = true;
            }
            rows = rows || [];
            if (!_.isUndefined(parent)) {
                this.setParent(parent);
            }
            _.each(rows, function(row) {
                this.append(row, false);
            }, this);
            this._updateFilters();
        },

        'parent': function() {
            return this._parent;
        },

        'fetch': function() {
            var d = $q.defer(),
                self = this;
            util.get(this.url(), {
                'cache': self._cache
            }).then(function(rows) {
                if (_.isArray(rows)) {
                    self._fetched = true;
                    self.replaceAll(rows);
                    d.resolve(self);
                } else {
                    d.reject('Invalid data received: expected array');
                }
            }, function(err) {
                d.reject(err);
            });
            return d.promise;
        },

        'create': function(data) {
            var d = $q.defer(),
                self = this;
            util.post(this.url(), data).then(function(result) {
                var model = self.append(result);
                d.resolve(model);
            }, function(err) {
                d.reject(err);
            });
            return d.promise;
        },

        'fetched': function() {
            return this._fetched;
        },

        'setParent': function(parent) {
            this._parent = parent;
        },

        'append': function(model, updateFilters) {
            var existing,
                self = this;
            if (!_.isBoolean(updateFilters)) {
                updateFilters = true;
            }
            if (!_.isFunction(model)) {
                model = new this._Model(model);
            }
            var where = {};
            where[model._id_attribute] = model.getId();
            existing = this.findWhere(where);
            if (existing) {
                this.replace(existing, model);
            } else {
                this.push(model, updateFilters);
            }
            if (updateFilters) {
                this._updateFilters();
            }
            return model;
        },

        'push': function(model, updateFilters) {
            if (!_.isBoolean(updateFilters)) {
                updateFilters = true;
            }
            this.collectionize(model);
            this.models.push(model);
            if (updateFilters) {
                this._updateFilters();
            }
        },

        'remove': function(model, updateFilters) {
            var idx = this.models.indexOf(model);
            if (idx < 0) {
                throw 'Specified model does not exist within this collection.';
            }
            this.models.splice(idx, 1);
            this.deCollectionize(model);
            if (!_.isBoolean(updateFilters)) {
                updateFilters = true;
            }
            if (updateFilters) {
                this._updateFilters();
            }
            return model;
        },

        /**
         * Returns a clone of this collection.
         *
         * @public
         */
        'clone': function() {
            var collection = new collections[this._collection_id](this.toObject(), this._parent);
            collection._fetched = this._fetched;
            return collection;
        },

        /**
         * Returns the model within the collection with the specified ID.
         *
         * @public
         */
        'id': function(id) {
            return _.find(this.models, function(model) {
                if (model[this._instance._id_attribute] == id) {
                    return true;
                }
            }, this);
        },

        'filter': function(fn) {
            return _.filter(this.models, fn);
        },

        'pluck': function(property) {
            return _.pluck(this.models, property);
        },

        'findWhere': function(query) {
            return _.findWhere(this.models, query);
        },

        'find': function(query) {
            return _.find(this.models, query);
        },

        'where': function(query) {
            return _.where(this.models, query);
        },

        'first': function() {
            return _.first(this.models);
        },

        'last': function() {
            return _.last(this.models);
        },

        'replace': function(existing, replacement, updateFilters) {
            var idx = this.models.indexOf(existing);
            if (idx < 0) {
                throw 'Specified model does not exist within this collection.';
            }
            this.collectionize(replacement);
            this.models.splice(idx, 1, replacement);
            this.deCollectionize(existing);
            if (!_.isBoolean(updateFilters)) {
                updateFilters = true;
            }
            if (updateFilters) {
                this._updateFilters();
            }
        },

        'replaceAll': function(rows, updateFilters) {
            this.clear();
            _.each(rows, function(row) {
                this.append(row);
            }, this);
            if (!_.isBoolean(updateFilters)) {
                updateFilters = true;
            }
            if (updateFilters) {
                this._updateFilters();
            }
        },

        'clear': function(updateFilters) {
            _.each(this.models, function(model, k) {
                this.deCollectionize(model);
                this.models.splice(k, 1);
            }, this);
            if (!_.isBoolean(updateFilters)) {
                updateFilters = true;
            }
            if (updateFilters) {
                this._updateFilters();
            }
        },

        'collectionize': function(model) {
            model.parent(this._parent);
            model.collection(this);
        },

        'deCollectionize': function(model) {
            model.parent(null);
            model.collection(null);
        },

        'toObject': function() {
            var result = [];
            _.each(this.models, function(model) {
                result.push(model.toObject());
            });
            return result;
        },

        'createFilter': function(name, filter) {
            if (this._filters[name]) {
                throw 'Filter `' + name + '` already exists.';
            }
            this._filters[name] = {
                'data': [],
                'filter': filter
            };
            this._updateFilters();
            return this._filters[name].data;
        },

        'getFilter': function(name) {
            return this._filters[name].data;
        },

        '_updateFilters': function() {
            _.each(this._filters, function(f, name) {
                var results;
                if (_.isFunction(f.filter)) {
                    results = _.filter(this.models, f.filter, this);
                } else {
                    results = _.where(this.models, f.filter);
                }
                results.unshift(f.data.length);
                results.unshift(0);
                Array.prototype.splice.apply(f.data, results);
            }, this);
        },

        'toJSON': function() {
            return JSON.stringify(this.toObject());
        },

        'each': function(fn) {
            _.each(this.models, fn);
        },

        'at': function(idx) {
            return this.models[idx];
        },

        'url': function() {
            var result = '';
            if (this._parent) {
                result = this._parent.url();
                result = util.rtrim(result, '/');
                result += '/' + util.trim(this._url, '/');
            } else if (this._rootUrl) {
                result = this._rootUrl;
                result = util.rtrim(result, '/');
            } else {
                console.log('this', this);
                console.log('u', this._rootUrl);
                console.log('m', this._model);
                throw 'Collection does not have a parent, and no value has been specified for `rootUrl`.';
            }
            return result;
        }

    });

    return BaseCollection;

};

},{"./util":4}],3:[function(require,module,exports){
'use strict';
/* global _ */

module.exports = function($http, $q) {

    var util = require('./util')($http, $q);

    return {

        '_init': function(properties, parent) {
            if (!_.isUndefined(parent)) {
                this.parent(parent);
            }
            if (_.isObject(properties) && !_.isEmpty(properties)) {
                this._fetched = true;
                this.setData(properties);
            }
        },

        'fetched': function() {
            return this._fetched;
        },

        'parent': function(parent) {
            if (!_.isUndefined(parent)) {
                Object.defineProperty(this, '_parent', {
                    'configurable': false,
                    'writable': true,
                    'enumerable': false,
                    'value': parent
                });
            } else {
                return this._parent;
            }
        },

        'collection': function(collection) {
            if (!_.isUndefined(collection)) {
                Object.defineProperty(this, '_collection', {
                    'configurable': false,
                    'writable': true,
                    'enumerable': false,
                    'value': collection
                });
            } else {
                return this._collection;
            }
        },

        'setData': function(properties) {
            this.setProperties(properties);
            this.createCollections(properties);
        },

        'createCollections': function(properties) {
            _.each(this._collections, function(collection, name) {
                if (!this[name]) {
                    this[name] = new collection(properties[name] || null, this);
                } else {
                    this[name].replaceAll(properties[name]);
                }
            }, this);
        },

        'setProperties': function(properties) {
            _.each(properties, function(v, k) {
                if (!this._collections[k]) {
                    this[k] = v;
                }
            }, this);
        },

        'get': function(k) {
            if (k.indexOf('.') < 0) {
                return this[k];
            }
            return _.deepGet(this, k);
        },

        'set': function(k, v) {
            if (k.indexOf('.') < 0) {
                return this[k] = v;
            }
            return _.deepSet(this, k, v);
        },

        'toObject': function() {
            var result = {},
                virtualKeys = _.keys(this._virtuals);
            _.each(this, function(v, k) {
                if (this.hasOwnProperty(k)) {
                    if (this._collections[k]) {
                        result[k] = v.toObject();
                    } else {
                        result[k] = v;
                    }
                }
            }, this);
            _.each(virtualKeys, function(vk) {
                if (result[vk]) {
                    delete result[vk];
                }
            });
            return result;
        },

        /**
         * When the `save` method of a Bonegular model is called, the data returned from this
         * method is sent to the server. You can override this if you need to.
         */
        'toJSON': function() {
            return this.toObject();
        },

        /**
         * Returns this model's unique ID.
         */
        'getId': function() {
            return this[this._id_attribute];
        },

        'url': function() {
            var result = '';
            if (this._collection) {
                // This model belongs to a collection.
                result = util.rtrim(this._collection.url(), '/');
                result += ( '/' + ((this.getId()) ? this.getId() : '' ) );
            } else if (this._parent) {
                // This model was directly assigned as a child of another model.
                if (!this._rootUrl) {
                    throw 'Models whose parent is another model must have a value for `rootUrl`.';
                }
                result = this._rootUrl + '/' + this.getId();
            } else {
                if (!this._rootUrl) {
                    throw 'Model has no parent, and no value has been specified for `rootUrl`.';
                }
                result = '/' + util.trim(this._rootUrl, '/');
                if (this.getId()) {
                    result = result + '/' + this.getId();
                }
            }
            result = util.rtrim(result, '/');
            return result;
        },

        'fetch': function(options) {
            options = options || {};
            _.defaults(options, {
                'collections': []
            });
            var d = $q.defer(),
                self = this;
            util.get(this.url(), {
                'cache': self._cache
            }).then(function(data) {
                self._fetched = true;
                self.setData(data);
                if (_.isEmpty(options.collections)) {
                    d.resolve(self);
                } else {
                    var missing = [];
                    _.each(options.collections, function(collection) {
                        if (!self._collections[collection]) {
                            throw 'Unknown collection specified: `' + collection + '`';
                        }
                        if (!self[collection].fetched()) {
                            missing.push(collection);
                        }
                    });
                    if (_.isEmpty(missing)) {
                        d.resolve(self);
                    } else {
                        var fetched = [];
                        _.each(missing, function(collection) {
                            fetched.push(self[collection].fetch());
                        });
                        $q.all(fetched).then(function() {
                            d.resolve(self);
                        }, function(err) {
                            d.reject(err);
                        });
                    }
                }
            }, function(err) {
                d.reject(err);
            });
            var p = d.promise;
            p.$object = this;
            return p;
        },

        'save': function() {
            var d = $q.defer(),
                self = this;
            if (this.getId()) {
                util.put(this.url(), this.toJSON()).then(function(data) {
                    self.setData(data);
                    d.resolve(self);
                }, function(err) {
                    d.reject(err);
                });
            } else {
                util.post(this.url(), this.toJSON()).then(function(data) {
                    self.setData(data);
                    d.resolve(self);
                }, function(err) {
                    d.reject(err);
                });
            }
            return d.promise;
        },

        /**
         * Submits a PATCH request to this model's URL. The model's properties will be
         * updated with the response that is received.
         */
        'patch': function(data) {
            var d = $q.defer(),
                self = this;
            util.patch(this.url(), data).then(function(data) {
                self.setData(data);
                d.resolve(self);
            }, function(err) {
                d.reject(err);
            });
            return d.promise;
        },

        /**
         * Submits a DELETE request to this model's URL. Upon confirmation, the model is
         * removed from its parent (if one is specified).
         */
        'destroy': function() {
            var d = $q.defer(),
                self = this;
            util.del(this.url()).then(function() {
                if (self.collection()) {
                    self.collection().remove(self);
                    d.resolve();
                } else {
                    d.resolve();
                }
            }, function(err) {
                d.reject(err);
            });
            return d.promise;
        }

    };

};

},{"./util":4}],4:[function(require,module,exports){
'use strict';
/* global _ */

module.exports = function($http, $q) {

    return {

        'get': function(url, options) {
            options = options || {};
            var d = $q.defer();
            var getOptions = {};
            if (options.cache) {
                getOptions.cache = options.cache;
            }
            $http.get(url, getOptions).then(function(result) {
                d.resolve(result.data);
            }, function(err) {
                d.reject(err);
            });
            return d.promise;
        },

        'put': function(url, data) {
            var d = $q.defer();
            $http.put(url, data).then(function(result) {
                d.resolve(result.data);
            }, function(err) {
                d.reject(err);
            });
            return d.promise;
        },

        'patch': function(url, data) {
            var d = $q.defer();
            $http({
                'url': url,
                'method': 'PATCH',
                'data': data
            }).then(function(result) {
                d.resolve(result.data);
            }, function(err) {
                d.reject(err);
            });
            return d.promise;
        },

        'post': function(url, data) {
            var d = $q.defer();
            $http.post(url, data).then(function(result) {
                d.resolve(result.data);
            }, function(err) {
                d.reject(err);
            });
            return d.promise;
        },

        'del': function(url) {
            var d = $q.defer();
            $http['delete'](url).then(function(result) {
                d.resolve(result.data);
            }, function(err) {
                d.reject(err);
            });
            return d.promise;
        },

        'trim': function(str, chars) {
            if (!str) {
                return '';
            }
            str = this.ltrim(str, chars);
            str = this.rtrim(str, chars);
            return str;
        },

        'ltrim': function(str, chars) {
            if (!chars) {
                chars = [' '];
            }
            if (!_.isArray(chars)) {
                chars = [chars];
            }
            for (var i = 0; i < str.length; i++) {
                if (chars.indexOf(str[i]) < 0) {
                    break;
                }
                str = str.substring(1);
            }
            return str;
        },

        'rtrim': function(str, chars) {
            str = this.reverseString(str);
            str = this.ltrim(str, chars);
            return this.reverseString(str);
        },

        'reverseString': function(str) {
            return str.split('').reverse().join('');
        },

        'getDeep': function(obj, k) {
        },

        'setDeep': function(obj, k, v) {
        }

    };

};

},{}]},{},[1,2,3,4]);