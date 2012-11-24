/*global Apply, it, expect, window, objects */
describe('Apply.singleton', function () {
    'use strict';

    beforeEach(function () {
        delete window.objects;
    });

    it('should accept a namespace, constructor argument array and constructor function', function () {
        var check = jasmine.createSpy();

        Apply.singleton('objects.object', ['test'], Apply.mixin({init: function(string) {
            expect(string).toBe('test');
            check();
        }}));

        expect(objects.object).toBeDefined();
        expect(check).toHaveBeenCalled();
    });

    it('should return the instance created', function() {
       expect(Apply.singleton('objects.object', [], Apply.mixin({}))).toBe(objects.object);
    });

    it('should be available to any mixin constructor', function () {
        Apply.mixin({prop1:'prop1'}).singleton('objects.object');

        expect(objects.object).toBeDefined();
        expect(objects.object.prop1).toBe('prop1');
    });

    it('should support namespacing an existing object if one is passed', function() {
        var ns = {};
        Apply.singleton(ns, 'test', [], Apply.mixin({}));

        expect(ns.test).toBeDefined();
    });

});