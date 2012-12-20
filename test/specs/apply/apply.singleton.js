/*global apply, it, expect, window, objects */
describe('apply.singleton', function () {
    'use strict';

    beforeEach(function () {
        delete window.objects;
    });

    it('should accept a namespace, constructor argument array and constructor function', function () {
        var check = jasmine.createSpy();

        apply.singleton('objects.object', ['test'], apply.compose({init: function(string) {
            expect(string).toBe('test');
            check();
        }}));

        expect(objects.object).toBeDefined();
        expect(check).toHaveBeenCalled();
    });

    it('should return the instance created', function() {
       expect(apply.singleton('objects.object', [], apply.compose({}))).toBe(objects.object);
    });

    it('should be available to any composed constructor', function () {
        apply.compose({prop1:'prop1'}).singleton('objects.object');

        expect(objects.object).toBeDefined();
        expect(objects.object.prop1).toBe('prop1');
    });

    it('should support namespacing an existing object if one is passed', function() {
        var ns = {};
        apply.singleton(ns, 'test', [], apply.compose({}));

        expect(ns.test).toBeDefined();
    });

});