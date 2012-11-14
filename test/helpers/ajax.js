/*global $, window */
(function() {
    'use strict';
    window.ajax = function(result, filter) {
        spyOn($, 'ajax').andCallFake(function(options) {
            for(var key in filter) {
                expect(filter[key]).toBe(options[key]);
            }
            if(options && options.success) {
                options.success(result);
            }
            var deferred = $.Deferred();
            deferred.resolve(result);
            return deferred.promise();
        });
    };
})();
