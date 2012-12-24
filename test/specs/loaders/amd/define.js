(function (root, undefined) {
	'use strict';

	describe('define', function () {

		var callback, content, factory;

		beforeEach(function () {
			callback = jasmine.createSpy();
			content = 'stuff';
			factory = function () {
				return {
					prop: 1
				};
			};
		});

		it('should define a function', function () {
			expect(define).toBeDefined();
		});

		it('should be defined as a function', function () {
			expect(typeof define === 'function').toBe(true);
		});

		it('should define an amd object on the define function', function () {
			expect(typeof define.amd === 'object').toBe(true);
		});

		it('should accept a factory callback as the first argument and call it immediately', function () {
			define(callback);

			expect(callback).toHaveBeenCalled();
		});

		it('should accept a module id as the first argument and a factory callback as the second', function () {
			define('my/module', callback);

			expect(callback).toHaveBeenCalled();
		});

		it('should be able to depend on a previously defined module', function () {
			define('my/module', factory);

			define(['my/module'], callback);

			expect(callback).toHaveBeenCalledWith(factory());
		});

		it('should be able to resolve dependencies at a later time once they\'re defined.', function () {
			root.xhr.spy();
			define(['unresolved'], callback);

			define('unresolved', factory);

			expect(callback).toHaveBeenCalledWith(factory());
		});

		it('should pass the dependencies every time a factory is called', function () {
			root.xhr.spy();
			define('module1', function () {
				return 'test';
			});
			define('module2', ['module1'], callback);

			define('module3', ['module2'], function () {});

			expect(callback.callCount).toBe(2);
			expect(callback.mostRecentCall.args).toEqual(['test']);
		});

		describe('remote resources', function () {

			var xhr;

			beforeEach(function () {
				xhr = root.xhr.spy();
			});

			it('should attempt to request a dependency from the server if not resolved', function () {
				define(['lib/test1'], callback);

				expect(root.XMLHttpRequest).toHaveBeenCalled();
			});

			it('should assume a file with no extension is a .js file', function () {
				define(['lib/test2'], callback);

				expect(xhr.open.mostRecentCall.args).toEqual(['GET', 'lib/test2.js', false]);
			});

			it('should eval the dependency if it is returned with a status of 200', function () {
				fakeResource();

				define(['lib/test3'], callback);

				expect(eval).toHaveBeenCalledWith(content);
			});

			it('should pass non evaluated content to the factory when the resource is not javascript', function () {
				fakeResource();

				define(['css/default.css'], callback);

				expect(callback).toHaveBeenCalledWith(content);
				expect(eval).not.toHaveBeenCalled();
			});

			function fakeResource(resource) {
				root.xhr.open(200, content);
				spyOn(root, 'eval');
			}

		});

	});
})(this);