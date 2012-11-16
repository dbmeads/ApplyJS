/*global $, window */
(function () {
    'use strict';

    var fake = function (options, filter, result) {
        for (var key in filter) {
            expect(filter[key]).toBe(options[key]);
        }
        var deferred = $.Deferred();
        if (options && options.success) {
            deferred.then(options.success);
        }
        deferred.resolve(result);
        return deferred.promise();
    };

    window.ajax = {
        setResult:function (result, filter) {
            spyOn($, 'ajax').andCallFake(function (options) {
                return fake(options, filter, result);
            });
        },
        getOptions:function (callback, filter) {
            spyOn($, 'ajax').andCallFake(function (options) {
                var promise = fake(options, filter, '');
                callback(options);
                return promise;
            });
        },
        neverReturn:function() {
            spyOn($, 'ajax').andCallFake(function() {
                return $.Deferred().promise();
            });
        }
    };
})();
