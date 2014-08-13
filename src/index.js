'use strict';

var bonegular = angular.module('bonegular', []);

bonegular.factory('bonegular', ['$http', '$q', function($http, $q) {

    var BaseModel, BaseCollection, createModel, createCollection, collections = {};

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

            Object.defineProperty(this, '_instance', {
                'configurable': false,
                'writable': true,
                'enumerable': false,
                'value': new options.model()
            });

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

            Object.defineProperty(this, '_cache', {
                'configurable': false,
                'writable': true,
                'enumerable': false,
                'value': options.cache || null
            });

            Object.defineProperty(this, 'models', {
                'configurable': false,
                'writable': true,
                'enumerable': true,
                'value': []
            });

            Object.defineProperty(this, '_model', {
                'configurable': false,
                'writable': false,
                'enumerable': false,
                'value': options.model
            });

            Object.defineProperty(this, '_Model', {
                'configurable': false,
                'writable': false,
                'enumerable': false,
                'value': options.model
            });

            Object.defineProperty(this, '_url', {
                'configurable': false,
                'writable': false,
                'enumerable': false,
                'value': options.url
            });

            Object.defineProperty(this, '_rootUrl', {
                'configurable': false,
                'writable': true,
                'enumerable': false,
                'value': options.rootUrl || null
            });

            Object.defineProperty(this, '_parent', {
                'configurable': false,
                'writable': true,
                'enumerable': false,
                'value': null
            });

            this._init.apply(this, arguments);

        };

        var collectionId = 'coll' + _.keys(collections).length;
        Object.defineProperty(Collection.prototype, '_collection_id', {
            'configurable': false,
            'writable': true,
            'enumerable': false,
            'value': collectionId
        });

        _.each(BaseCollection, function(method, name) {
            Object.defineProperty(Collection.prototype, name, {
                'configurable': false,
                'writable': false,
                'enumerable': false,
                'value': method
            });
        });

        _.each(options.methods, function(method, name) {
            Object.defineProperty(Collection.prototype, name, {
                'configurable': false,
                'writable': false,
                'enumerable': false,
                'value': method
            });
        });

        Collection.create = function() {
            var collection = new this;
            return collection.create.apply(collection, arguments);
        };

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
