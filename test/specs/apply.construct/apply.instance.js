(function (root, apply) {
	'use strict';

	describe('apply.instance', function () {

		beforeEach(function () {
			root.objects = undefined;
		});

		it('should accept a namespace, constructor argument array and constructor function', function () {
			var check = jasmine.createSpy();

			apply.instance('objects.object', ['test'], apply.compose({
				init: function (string) {
					expect(string).toBe('test');
					check();
				}
			}));

			expect(root.objects.object).toBeDefined();
			expect(check).toHaveBeenCalled();
		});

		it('should return the instance created', function () {
			expect(apply.instance('objects.object', [], apply.compose({}))).toBe(root.objects.object);
		});

		it('should be available to any composed constructor', function () {
			apply.compose({
				prop1: 'prop1'
			}).instance('objects.object');

			expect(root.objects.object).toBeDefined();
			expect(root.objects.object.prop1).toBe('prop1');
		});

		it('should support namespacing an existing object if one is passed', function () {
			var ns = {};
			apply.instance(ns, 'test', [], apply.compose({}));

			expect(ns.test).toBeDefined();
		});

	});
})(this, this.apply);