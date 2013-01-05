(function (root, apply, ajaxSpy) {
	'use strict';

	describe('apply.Rest', function () {

		var TestRest = apply.Rest({
			getUrl: function () {
				return 'testUrl';
			}
		});

		describe('save', function () {
			it('should delegate to "toString()" for data, "getUrl()" for the url and "contentType" for the contentType needed', function () {
				ajaxSpy.getOptions(function (options) {
					expect(options.data).toBe('something');
					expect(options.url).toBe('testUrl');
					expect(options.contentType).toBe('text/xml');
				});

				new(apply.Rest({
					toString: function () {
						return 'something';
					},
					getUrl: function () {
						return 'testUrl';
					},
					contentType: 'text/xml'
				}))().save();
			});

			it('should POST by default', function () {
				ajaxSpy.getOptions(function (options) {
					expect(options.type).toBe("POST");
				});

				new TestRest().save();
			});

			it('should PUT if the object has a "getId()" function and it returns an id', function () {
				ajaxSpy.getOptions(function (options) {
					expect(options.type).toBe("PUT");
				});

				new(TestRest.compose({
					getId: function () {
						return '1';
					}
				}))().save();
			});
		});

		describe('fetch', function () {
			it('should "GET" data and callback with "context", "response" and "options"', function () {
				var result = {
					name: 'Tom'
				};
				ajaxSpy.setResult(result);
				var called = false;
				var callback = jasmine.createSpy();
				var obj = new TestRest();

				obj.fetch(callback).then(function (model, response, options) {
					expect(model).toBe(obj);
					expect(response).toBe(response);
					called = true;
				});

				expect(called).toBe(true);
				expect(callback).toHaveBeenCalled();
			});

		});

	});
})(this, this.apply, this.ajaxSpy);