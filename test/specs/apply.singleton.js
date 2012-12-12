/*global apply, it, expect, window, objects */
describe('apply.singleton', function () {
    'use strict';

    beforeEach(function () {
        delete window.objects;
    });

    it('should accept a namespace, constructor argument array and constructor function', function () {
        var check = jasmine.createSpy();

        apply.singleton('objects.object', ['test'], apply.generate({init: function(string) {
            expect(string).toBe('test');
            check();
        }}));

        expect(objects.object).toBeDefined();
        expect(check).toHaveBeenCalled();
    });

    it('should return the instance created', function() {
       expect(apply.singleton('objects.object', [], apply.generate({}))).toBe(objects.object);
    });

    it('should be available to any generate constructor', function () {
        apply.generate({prop1:'prop1'}).singleton('objects.object');

        expect(objects.object).toBeDefined();
        expect(objects.object.prop1).toBe('prop1');
    });

    it('should support namespacing an existing object if one is passed', function() {
        var ns = {};
        apply.singleton(ns, 'test', [], apply.generate({}));

        expect(ns.test).toBeDefined();
    });

});