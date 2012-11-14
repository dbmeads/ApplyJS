/*global Apply, it, expect */
describe('Apply.namespace', function () {
    'use strict';

    it('should assign an object to the specified namespace', function () {
        var obj = {prop:'prop'};

        Apply.namespace('Test.Object', obj);

        /*global Test*/
        expect(Test.Object).toBe(obj);
    });
});