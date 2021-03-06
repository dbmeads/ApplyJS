(function (root, apply, ajaxSpy, $) {
	'use strict';

	describe('apply.dependency', function () {

		var callback;

		beforeEach(function () {
			callback = jasmine.createSpy();
		});

		describe('general', function () {
			var text = 'hello!';

			beforeEach(function () {
				ajaxSpy.setResult(text);
			});

			it('should be able to load a file from the internet', function () {
				apply.dependency('test.atl').done(callback);

				expect($.ajax.callCount).toBe(1);
				expect(callback.callCount).toBe(1);
				expect(callback.mostRecentCall.args[0]).toBe(text);
			});

			it('should return a cached version if the resource was already requested', function () {
				apply.dependency('test2.atl');
				apply.dependency('test2.atl').done(callback);

				expect($.ajax.callCount).toBe(1);
				expect(callback.callCount).toBe(1);
				expect(callback.mostRecentCall.args[0]).toBe(text);
			});

			it('should be able to apply the promise to a target object', function () {
				var target = {};
				apply.dependency('test.atl', target);

				target.done(callback);

				expect(callback.callCount).toBe(1);
				expect(callback.mostRecentCall.args[0]).toBe(text);
			});

			it('should properly resolve promise objects created after initial dependency call', function () {
				var target = {};
				apply.dependency('test.atl');
				apply.dependency('test.atl', target);

				target.done(callback);

				expect(callback.callCount).toBe(1);
				expect(callback.mostRecentCall.args[0]).toBe(text);
			});

			it('should not return previously applied promise object when dependency is called again', function () {
				apply.dependency('test.atl', {
					prop: 1
				});

				var result = apply.dependency(('test.atl'));

				expect(result.prop).not.toBeDefined();
			});

		});

		describe('JavaScript files', function () {

			beforeEach(function () {
				ajaxSpy.setResult('window.x = 1;');
			});

			it('should execute .js files by default', function () {
				apply.dependency('test.js');

				expect(root.x).toBe(1);
			});
		});

	});
})(this, this.apply, this.ajaxSpy, this.jQuery);