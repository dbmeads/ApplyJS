(function (root) {
	'use strict';

	describe('apply.composer', function () {
		xit('should register a callback to be invoked on any new composed constructor that utilizes the constructor it\'s attached to', function () {
			var Constructor1 = apply.compose({});
			Constructor1.composer(function (constructor) {
				constructor.prop = 'prop';
			});

			var Constructor2 = Constructor1({});

			expect(Constructor2.prop).toBe('prop');
		});
	});
})(this);