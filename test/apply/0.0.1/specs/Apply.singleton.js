/*global Apply, it, expect, window */
describe('Apply.singleton', function() {
	'use strict';
	
	beforeEach(function() {
		window.objects = undefined;
	});
	
	it('should create the singleton assigned to the specified namespace', function() {
		Apply.singleton('objects.object1', {prop: 'prop'});
		
		expect(objects.object1).toBeDefined();
		expect(objects.object1.prop).toBeDefined();
	});
	
	it('should be available to any mixin constructor', function() {
		Apply.mixin({prop1: 'prop1'}).singleton('objects.object2', {prop2: 'prop2'});
		
		expect(objects.object2).toBeDefined();
		expect(objects.object2.prop1).toBe('prop1');
		expect(objects.object2.prop2).toBe('prop2');
	});	
});