(function (root, apply, ajaxSpy) {
	'use strict';

	describe('apply.List', function () {

		it('should recognize the size of a list passed into the constructor', function () {
			var list = new apply.List([{
				name: 'Frank'
			},
			{
				name: 'Pete'
			}]);

			expect(list.size()).toBe(2);
		});

		it('should support a get method that returns an apply.Model from the list by default', function () {
			var list = new apply.List([{
				name: 'Frank'
			},
			{
				name: 'Pete'
			}]);

			expect(list.get(0).deflate()).toEqual({
				name: 'Frank'
			});
			expect(list.get(1).deflate()).toEqual({
				name: 'Pete'
			});
		});

		it('should not add a model or fail if nothing is passed to the constructor', function () {
			var list = new apply.List();

			expect(list.size()).toBe(0);
		});

		it('should support an add method that allows the addition of additional objects to the list', function () {
			var list = new apply.List([{
				name: 'Frank'
			}]);

			list.add([{
				name: 'Pete'
			},
			{
				name: 'Henry'
			}]);

			expect(list.size()).toBe(3);
			expect(list.get(0).deflate()).toEqual({
				name: 'Frank'
			});
			expect(list.get(1).deflate()).toEqual({
				name: 'Pete'
			});
			expect(list.get(2).deflate()).toEqual({
				name: 'Henry'
			});
		});

		it('should support the addition of a single object through the add method', function () {
			var list = new apply.List([{
				name: 'Frank'
			}]);

			list.add({
				name: 'Pete'
			});

			expect(list.size()).toBe(2);
			expect(list.get(0).deflate()).toEqual({
				name: 'Frank'
			});
			expect(list.get(1).deflate()).toEqual({
				name: 'Pete'
			});
		});

		it('should support mapping to other models', function () {
			var MyModel = apply.Model({
				prop: 'prop'
			});
			var MyList = apply.List({
				mapping: MyModel
			});

			var object = new MyList([{
				name: 'Frank'
			}]).get(0);

			expect(Object.getPrototypeOf(object)).toBe(MyModel.prototype);
			expect(object.deflate()).toEqual({
				name: 'Frank'
			});
		});

		it('should support the addition of models', function () {
			var MyModel = apply.Model();
			var MyList = apply.List({
				mapping: MyModel
			});
			var object = new MyModel();

			expect(new MyList(object).get(0)).toBe(object);
		});

		it('should reject the addition of models and other mixins that do not match the mapping', function () {
			var DifferentModel = apply.Model();

			expect(function () {
				new apply.List(new DifferentModel());
			}).toThrow(new Error('Attempted to add an incompatible model to a list.'));
		});

		it('should support the removal of a model from a list', function () {
			var list = new apply.List([{
				name: 'Todd'
			},
			{
				name: 'Jim'
			}]);
			var model = list.get(0);

			list.remove(model);

			expect(list.size()).toBe(1);
			expect(list.get(0).get('name')).toBe('Jim');
		});

		it('should support the removal of an array of models', function () {
			var list = new apply.List([{
				name: 'Todd'
			},
			{
				name: 'Jim'
			},
			{
				name: 'frank'
			}]);

			list.remove([list.get(0), list.get(2)]);

			expect(list.size()).toBe(1);
			expect(list.get(0).get('name')).toBe('Jim');
		});

		it('should be able to deflate back into the base javascript objects', function () {
			var data = [{
				name: 'Tom'
			},
			{
				name: 'Dan'
			}];

			expect(new apply.List(data).deflate()).toEqual(data);
		});

		describe('events', function () {
			it('should support "on" and "trigger"', function () {
				var list = new apply.List();
				var callback = jasmine.createSpy();

				list.on('test', callback);
				list.trigger('test', 'cool');

				expect(callback).toHaveBeenCalledWith('cool');
			});

			it('should trigger an "add" event when a model is added', function () {
				var list = new apply.List();
				var callback = jasmine.createSpy();

				list.on('add', callback);
				list.add({
					name: 'Tedd'
				});

				expect(callback).toHaveBeenCalledWith(list.get(0));
			});

			it('should trigger a "remove" event when a model is removed', function () {
				var list = new apply.List({
					name: 'Tedd'
				});
				var model = list.get(0);
				var callback = jasmine.createSpy();

				list.on('remove', callback);
				list.remove(model);

				expect(callback).toHaveBeenCalledWith(model);
			});

		});

	});
})(this, this.apply, this.ajaxSpy);