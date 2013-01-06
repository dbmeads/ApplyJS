(function (root, apply, $, ajaxSpy) {
	'use strict';

	describe('apply.rest.Model', function () {
		it('should support a save method that will POST to a urlRoot if id is not defined', function () {
			ajaxSpy.setResult();
			var model = new(apply.rest.Model.compose({
				urlRoot: '/users'
			}))({
				firstname: 'Dave'
			});

			model.save();

			expect($.ajax).toHaveBeenCalledWith({
				url: '/users',
				type: 'POST',
				data: '{"firstname":"Dave"}',
				contentType: 'application/json'
			});
		});

		it('should support a save method that will PUT to urlRoot/{id} if id is defined', function () {
			ajaxSpy.setResult();
			var model = new(apply.rest.Model.compose({
				urlRoot: '/users'
			}))({
				id: 1,
				firstname: 'Dave'
			});

			model.save();

			expect($.ajax).toHaveBeenCalledWith({
				url: '/users/1',
				type: 'PUT',
				data: '{"id":1,"firstname":"Dave"}',
				contentType: 'application/json'
			});
		});

		xit('should automatically update the model with the response from save', function () {
			ajaxSpy.setResult({
				id: 3,
				firstname: 'Dave'
			});
			var model = new(apply.rest.Model.compose({
				urlRoot: '/users'
			}))({
				firstname: 'Dave'
			});

			model.save();

			expect(model.get('id')).toBe(3);
			expect(model.get('firstname')).toBe('Dave');
		});

		it('should support a destroy method that will DELETE a urlRoot/{id}', function () {
			ajaxSpy.setResult();
			var model = new(apply.rest.Model.compose({
				urlRoot: '/users'
			}))({
				id: 1
			});

			model.destroy();

			expect($.ajax).toHaveBeenCalledWith({
				url: '/users/1',
				type: 'DELETE'
			});
		});

		it('should support a fetch method that will GET a urlRoot/{id}', function () {
			ajaxSpy.setResult();
			var model = new(apply.rest.Model.compose({
				urlRoot: '/users'
			}))({
				id: 1
			});

			model.fetch();

			expect($.ajax).toHaveBeenCalledWith({
				url: '/users/1',
				type: 'GET'
			});
		});

		it('should apply any fetched attributes to the model', function () {
			ajaxSpy.setResult({
				id: 1,
				firstname: 'Dave'
			});
			var model = new(apply.rest.Model.compose({
				urlRoot: '/users'
			}))({
				id: 1
			});

			model.fetch();

			expect(model.get('id')).toBe(1);
			expect(model.get('firstname')).toBe('Dave');
		});

		it('should save models with the appropriate json', function () {
			ajaxSpy.setResult();
			var Student = apply.rest.Model({
				urlRoot: '/students',
				mappings: {
					'school': apply.rest.Model
				}
			});

			new Student({
				name: 'Sam',
				school: {
					name: 'Prime Elementary'
				}
			}).save();

			expect($.ajax).toHaveBeenCalledWith({
				url: jasmine.any(String),
				type: jasmine.any(String),
				contentType: jasmine.any(String),
				data: '{"name":"Sam","school":{"name":"Prime Elementary"}}'
			});
		});
	});


	describe('delegation', function () {
		it('should delegate "save" calls to the top level parent by default', function () {
			ajaxSpy.setResult();
			var Student = apply.rest.Model({
				urlRoot: '/students',
				mappings: {
					'school': apply.rest.Model
				}
			});

			new Student({
				name: 'Sam',
				school: {
					name: 'Prime Elementary'
				}
			}).get('school').save();

			expect($.ajax).toHaveBeenCalledWith({
				url: jasmine.any(String),
				type: jasmine.any(String),
				contentType: jasmine.any(String),
				data: '{"name":"Sam","school":{"name":"Prime Elementary"}}'
			});
		});

		it('should delegate "fetch" calls to the top level parent by default', function () {
			ajaxSpy.setResult();
			var Student = apply.rest.Model({
				urlRoot: '/students',
				mappings: {
					'school': apply.rest.Model
				}
			});

			new Student({
				id: 1,
				name: 'Sam',
				school: {
					name: 'Prime Elementary'
				}
			}).get('school').fetch();

			expect($.ajax).toHaveBeenCalledWith({
				url: '/students/1',
				type: 'GET'
			});
		});

		it('should delegate "destroy" calls to the top level parent by default', function () {
			ajaxSpy.setResult();
			var Student = apply.rest.Model({
				urlRoot: '/students',
				mappings: {
					'school': apply.rest.Model
				}
			});

			new Student({
				id: 1,
				name: 'Sam',
				school: {
					name: 'Prime Elementary'
				}
			}).get('school').destroy();

			expect($.ajax).toHaveBeenCalledWith({
				url: '/students/1',
				type: 'DELETE'
			});
		});
	});

})(this, this.apply, this.jQuery, this.ajaxSpy);