(function (root, apply) {
	'use strict';

	describe('apply.mixins.validation', function () {

		var Model;

		beforeEach(function () {
			Model = apply.Model(apply.mixins.validation);
		});

		it('should recognize when a required field is not populated', function () {
			var model = Model({
				validation: {
					name: ['required']
				}
			}).instance([{
				name: ''
			}]);

			expect(model.validate()).toBe(false);
		});

		it('should recognize when a required field is populated', function () {
			var model = Model({
				validation: {
					name: ['required']
				}
			}).instance([{
				name: 'Frank'
			}]);

			expect(model.validate()).toBe(true);
		});

	});
})(this, this.apply);