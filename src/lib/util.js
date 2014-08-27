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
