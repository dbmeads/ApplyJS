(function (root, apply) {
	'use strict';

	describe('apply.isInstanceOf', function () {

		var mixin;

		beforeEach(function () {
			mixin = apply.compose({});
		});

		it('should be able to take any composed constructor and determine if an object contains it', function () {
			expect(apply.isInstanceOf(mixin, mixin({}).instance())).toBe(true);
		});

		it('should recognize that a seperate composed instance is not an instance of it', function () {
			expect(apply.isInstanceOf(mixin, apply.compose({}).instance())).toBe(false);
		});

		it('should recognize that a plain object isn\'t an instance of a composed constructor', function () {
			expect(apply.isInstanceOf(mixin, {})).toBe(false);
		});

		it('should recognize that object created with it are in fact instances of it', function () {
			expect(apply.isInstanceOf(mixin, mixin.instance())).toBe(true);
		});

		it('should be able to be called on a composed instance directly', function () {
			expect(mixin.instance().isInstanceOf(mixin)).toBe(true);
		});

		xit('should be able to handle more complex composed constructors / objects', function () {
			expect(apply.compose(mixin({})).instance().isInstanceOf(mixin)).toBe(true);
		});

	});
})(this, this.apply);