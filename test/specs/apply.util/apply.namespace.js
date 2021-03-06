(function (root, apply) {
	'use strict';

	describe('apply.namespace', function () {

		afterEach(function () {
			root.Test = undefined;
		});

		it('should assign an object to the specified namespace', function () {
			var obj = {
				prop: 'prop'
			};

			apply.namespace('Test.Object', obj);

			expect(root.Test.Object).toBe(obj);
		});

		it('should allow for extending an existing namespace', function () {
			var obj = {
				prop: 'prop'
			};
			var ns = {};

			apply.namespace(ns, 'Test.Object', obj);

			expect(ns.Test.Object).toBe(obj);
		});

		it('should also be capable of returning what\'s at a given namespace', function () {
			var obj = {};
			apply.namespace('Test.Namespace.object', obj);

			expect(apply.namespace('Test.Namespace.object')).toBe(obj);
		});

		it('should be able to return data namespaced relative to an object', function () {
			var obj = {};

			apply.namespace('Test.Namespace.object2', obj);

			expect(apply.namespace(root.Test, 'Namespace.object2')).toBe(obj);
		});

		it('should be able to set an empty key if desired', function () {
			var obj = {};

			apply.namespace(obj, '', 'test');

			expect(obj['']).toBeDefined();
		});

	});
})(this, this.apply);