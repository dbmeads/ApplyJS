(function (root, apply) {
	'use strict';

	describe('apply.mongo.Model', function () {
		it('should map id to _id', function () {
			expect(apply.mongo.Model.prototype.id).toBe('_id');
		});
	});
})(this, this.apply);