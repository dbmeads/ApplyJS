(function (root, apply) {
	'use strict';

	describe('apply.compose', function () {

		it('should be able to provide an extended constructor', function () {
			var result = apply.compose({
				prop1: 'test'
			});

			expect(result.prototype.prop1).toBe('test');
		});

		it('should provide a constructor capable of invoking an init function if provided', function () {
			var Constructor = apply.compose({
				init: function (message) {
					this.message = message;
				}
			});

			var result = new Constructor('sweet');

			expect(result.message).toBe('sweet');
		});

		it('should be able to apply mixins with properties overlaid in order from lowest to highest ordinal', function () {
			var result = apply.compose({
				prop1: 'obj2',
				prop3: 'obj2'
			}, {
				prop1: 'obj1',
				prop2: 'obj1'
			});

			expect(result.prototype.prop1).toBe('obj1');
			expect(result.prototype.prop2).toBe('obj1');
			expect(result.prototype.prop3).toBe('obj2');
		});

		it('should provide a compose function on any returned constructor that allows additional constructors to be composed that include it as one of the mixins', function () {
			var Constructor = apply.compose({
				prop1: 'Constructor',
				prop2: 'Constructor'
			});

			var result = Constructor.compose({
				prop1: 'result'
			});

			expect(result.compose).toBeDefined();
			expect(result.prototype.prop1).toBe('result');
			expect(result.prototype.prop2).toBe('Constructor');
			expect(Constructor.prototype.prop1).toBe('Constructor');
		});

		it('should cascade init functions across mixins', function () {
			var Constructor = apply.compose({
				init: function () {
					this.prop1 = 'prop1';
				}
			}).compose({
				init: function () {
					this.prop2 = 'prop2';
				}
			});

			var result = new Constructor();

			expect(result.prop1).toBeDefined();
			expect(result.prop2).toBeDefined();
		});

		it('should support passing mixins as multiple parameters', function () {
			var result = apply.compose({
				prop1: 'prop1'
			}, {
				prop2: 'prop2'
			});

			expect(result.prototype.prop1).toBe('prop1');
			expect(result.prototype.prop2).toBe('prop2');
		});

		it('should support an optional namespace as the first parameter', function () {
			var result = apply.compose('Mixin.Object2', {
				prop1: 'prop1'
			}, {
				prop2: 'prop2'
			});

			expect(root.Mixin.Object2).toBeDefined();
			expect(root.Mixin.Object2.prototype.prop1).toBe('prop1');
			expect(root.Mixin.Object2.prototype.prop2).toBe('prop2');
		});

		it('should also support namespaces when invoking compose from a previously composed constructor', function () {
			var result = apply.compose({
				prop1: 'prop1'
			}).compose('Mixin.Object3', {
				prop2: 'prop2'
			});

			expect(root.Mixin.Object3).toBeDefined();
			expect(root.Mixin.Object3.prototype.prop1).toBe('prop1');
			expect(root.Mixin.Object3.prototype.prop2).toBe('prop2');
		});

		it('should assume that if the constructor is invoked without a new instance of itself, that compose is desired', function () {
			var result = apply.compose({
				prop1: 'prop1'
			})({
				prop2: 'prop2'
			});

			expect(result.prototype.prop1).toBe('prop1');
			expect(result.prototype.prop2).toBe('prop2');
		});

		it('should support namespacing when mixins are applied through constructor invocation', function () {
			apply.compose({
				prop1: 'prop1'
			})('Mixin.MyObject', {
				prop2: 'prop2'
			});

			expect(root.Mixin.MyObject).toBeDefined();
			expect(root.Mixin.MyObject.prototype.prop1).toBe('prop1');
			expect(root.Mixin.MyObject.prototype.prop2).toBe('prop2');
		});

		it('should support the registration of code generators to be invoked when descendants of a constructor have been created', function () {
			var composed = apply.compose({
				test: 1
			}).generator(function (descendant) {
				descendant.prototype.test = 2;
			});

			expect(composed.compose({
				prop2: 'prop'
			}).prototype.test).toBe(2);
		});

		it('should retain the list of original mixins on the constructor', function () {
			var mixins = [{},
			{}];

			var composed = apply.compose(mixins[0], mixins[1]);

			expect(composed.mixins[0]).toBe(mixins[0]);
			expect(composed.mixins[1]).toBe(mixins[1]);
		});

		it('should be able to recompose a constructor\'s prototype if compose is called without any mixins', function () {
			var mixin1 = {
				prop1: 'mixin1',
				prop2: 'mixin1'
			},
				mixin2 = {
					prop2: 'mixin2'
				};
			var Constructor = apply.compose(mixin1, mixin2);
			Constructor.prototype = {};

			Constructor.compose();

			expect(Constructor.prototype.prop1).toBe('mixin1');
			expect(Constructor.prototype.prop2).toBe('mixin2');
		});

	});
})(this, this.apply);