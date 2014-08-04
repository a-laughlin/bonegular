'use strict';

module.exports = function($http, $q) {

    var util = require('./util')($http, $q);

    return {

        '_init': function(rows, parent) {
            if (_.isArray(rows)) {
                this._fetched = true;
            }
            rows = rows || [];
            if (!_.isUndefined(parent)) {
                this.setParent(parent);
            }
            _.each(rows, function(row) {
                this.append(row);
            }, this);
        },

        'parent': function() {
            return this._parent;
        },

        'get': function() {
            var d = $q.defer(),
                self = this;
            util.get(this.url(), {
                'cache': self._cache
            }).then(function(rows) {
                if (_.isArray(rows)) {
                    self._fetched = true;
                    _.each(rows, function(row) {
                        self.append(row);
                    });
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

        'append': function(model) {
            var existing,
                self = this;
            if (!_.isFunction(model)) {
                model = new this._Model(model);
            }
            var where = {};
            where[model._id_attribute] = model.getId();
            existing = this.findWhere(where);
            if (existing) {
                this.replace(existing, model);
            } else {
                this.push(model);
            }
            return model;
        },

        'push': function(model) {
            this.collectionize(model);
            this.models.push(model);
        },

        'remove': function(model) {
            var idx = this.models.indexOf(model);
            if (idx < 0) {
                throw 'Specified model does not exist within this collection.';
            }
            this.models.splice(idx, 1);
            this.deCollectionize(model);
            return model;
        },

        'id': function(id) {
            var where = {};
            where[this._instance._id_attribute] = id;
            return _.findWhere(this.models, where);
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

        'replace': function(existing, replacement) {
            var idx = this.models.indexOf(existing);
            if (idx < 0) {
                throw 'Specified model does not exist within this collection.';
            }
            this.collectionize(replacement);
            this.models.splice(idx, 1, replacement);
            this.deCollectionize(existing);
        },

        'replaceAll': function(rows) {
            this.clear();
            _.each(rows, function(row) {
                this.append(row);
            }, this);
        },

        'clear': function() {
            _.each(this.models, function(model, k) {
                this.deCollectionize(model);
                this.models.splice(k, 1);
            }, this);
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
            if (this._rootUrl) {
                result = this._rootUrl;
            } else {
                if (this._parent) {
                    result = this._parent.url();
                } else {
                    throw 'Model does not have a parent, and no value has been specified for `rootUrl`.';
                }
            }
            result = util.rtrim(result, '/');
            result += '/' + util.trim(this._url, '/');
            return result;
        }

    };

};
