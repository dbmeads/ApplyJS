(function (root, apply, ajaxSpy) {
	'use strict';

	describe('apply.rest.List', function () {
		it('should support fetching from a server', function () {
			ajaxSpy.setResult([{
				name: 'Don'
			},
			{
				name: 'Pam'
			}]);
			var list = new(apply.rest.List({
				urlRoot: '/animals'
			}))();

			list.fetch(function (list) {
				expect(list.size()).toBe(2);
				expect(list.get(0).get('name')).toBe('Don');
				expect(list.get(1).get('name')).toBe('Pam');
			});
		});

		it('should have a getUrl function that returns urlRoot by default', function () {
			expect(new(apply.rest.List({
				urlRoot: 'test'
			}))().getUrl()).toBe('test');
		});
	});

})(this, this.apply, this.ajaxSpy);