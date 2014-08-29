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

        /*
        Object.defineProperty(this, '_filters', {
            'configurable': false,
            'writable': true,
            'enumerable': false,
            'value': {}
        });
        */

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
            this._initFilters();
            this._initVirtuals();
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

        '_initVirtuals': function() {
            _.each(this._protoVirtuals, function(virtual, name) {
                this.createVirtual(name, virtual);
            }, this);
        },

        '_initFilters': function() {
            this._filters = {};
            _.each(this._protofilters, function(filter, name) {
                this.createFilter(name, filter);
            }, this);
        },

        'createFilter': function(name, filter) {
            if (this._filters[name]) {
                throw 'Filter `' + name + '` already exists.';
            }
            this._filters[name] = {
                'data': [],
                'filter': filter
            };
            this.createVirtual(name, function() {
                return this._filters[name].data;
            });
            this._updateFilters();
            return this._filters[name].data;
        },

        'createVirtual': function(name, virtual) {
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
                throw 'Collection does not have a parent, and no value has been specified for `rootUrl`.';
            }
            return result;
        }

    });

    return BaseCollection;

};

