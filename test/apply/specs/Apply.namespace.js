/*global Apply, it, expect, window, afterEach, namespace */
describe('Apply.namespace', function () {
    'use strict';

    afterEach(function() {
        delete window.Test;
    });

    it('should assign an object to the specified namespace', function () {
        var obj = {prop:'prop'};

        Apply.namespace('Test.Object', obj);

        /*global Test*/
        expect(Test.Object).toBe(obj);
    });

    it('should allow for extending an existing namespace', function () {
        var obj = {prop: 'prop'};
        var ns = {};

        Apply.namespace(ns, 'Test.Object', obj);

        expect(ns.Test.Object).toBe(obj);
    });

    it('should also be capable of returning what\'s at a given namespace', function() {
        var obj = {};
        Apply.namespace('Test.Namespace.object', obj);

        expect(namespace('Test.Namespace.object')).toBe(obj);
    });

    it('should be able to return data namespaced relative to an object', function() {
        var obj = {};

        Apply.namespace('Test.Namespace.object2', obj);

        expect(namespace(Test, 'Namespace.object2')).toBe(obj);
    });

    it('should be able to set an empty key if desired', function() {
        var obj = {};

        Apply.namespace(obj, '', 'test');

        expect(obj['']).toBeDefined();
    });

});