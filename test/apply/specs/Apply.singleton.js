/*global Apply, it, expect, window, objects */
describe('Apply.singleton', function () {
    'use strict';

    beforeEach(function () {
        delete window.objects;
    });

    it('should create the singleton assigned to the specified namespace that\'s an instance of a mixin generated out of the remaining arguments', function () {
        Apply.singleton('objects.object', {prop:'prop'});

        expect(objects.object).toBeDefined();
        expect(objects.object.prop).toBeDefined();
    });

    it('should return the instance created', function() {
       expect(Apply.singleton('objects.object', {})).toBe(objects.object);
    });

    it('should be available to any mixin constructor', function () {
        Apply.mixin({prop1:'prop1'}).singleton('objects.object', {prop2:'prop2'});

        expect(objects.object).toBeDefined();
        expect(objects.object.prop1).toBe('prop1');
        expect(objects.object.prop2).toBe('prop2');
    });

    it('should simply create the object and not create a new mixin if there is nothing to mixin', function() {
        var check = jasmine.createSpy();

        Apply.mixin({}).construct(function() {
            check();
        }).singleton('objects.object');

        expect(check.callCount).toBe(0);
    });

});