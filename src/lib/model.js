'use strict';

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

        'toObject': function() {
            var result = {};
            _.each(this, function(v, k) {
                if (this.hasOwnProperty(k)) {
                    if (this._collections[k]) {
                        result[k] = v.toObject();
                    } else {
                        result[k] = v;
                    }
                }
            }, this);
            return result;
        },

        'toJSON': function() {
            return JSON.stringify(this.toObject());
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
                result = util.rtrim(this._collection.url(), '/');
                result += ( '/' + ((this.getId()) ? this.getId() : '' ) );
            } else {
                if (!this._rootUrl) {
                    throw 'Model does not belong to a collection, and no value has been specified for `rootUrl`.';
                }
                result = '/' + util.trim(this._rootUrl, '/');
                if (this.getId()) {
                    result = result + '/' + this.getId();
                }
            }
            result = util.rtrim(result, '/');
            return result;
        },

        'get': function(options) {
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
                            fetched.push(self[collection].get());
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
                util.put(this.url(), this.toObject()).then(function(data) {
                    self.setData(data);
                    d.resolve(self);
                }, function(err) {
                    d.reject(err);
                });
            } else {
                util.post(this.url(), this.toObject()).then(function(data) {
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
