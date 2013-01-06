(function (root, apply) {
	'use strict';

	describe('apply.Model', function () {

		var callback, model;

		beforeEach(function () {
			callback = jasmine.createSpy();
			model = new apply.Model({
				firstname: 'Dave'
			});
		});

		it('should be able to construct a model that has attributes set on it', function () {
			expect(model.attributes.firstname).toBe('Dave');
		});

		it('should support setting of attributes after a model is created without touching other attributes', function () {
			model.set({
				lastname: 'Meads'
			});

			expect(model.attributes.firstname).toBe('Dave');
			expect(model.attributes.lastname).toBe('Meads');
		});

		it('should support the return of attributes via a get method', function () {
			expect(model.get('firstname')).toBe('Dave');
		});

		it('should support a clear method that clears all attributes', function () {
			model.clear();

			expect(model.attributes).toEqual({});
		});

		it('should be able to handle nested models via mappings', function () {
			var Student = apply.Model({
				mappings: {
					'school': apply.Model
				}
			});

			var result = new Student({
				name: 'Sam',
				school: {
					name: 'Prime Elementary'
				}
			});

			expect(result.get('name')).toBe('Sam');
			expect(result.get('school').constructor).toBe(apply.Model);
			expect(result.get('school').get('name')).toBe('Prime Elementary');
		});

		it('should support model copying via the set method', function () {
			var model1 = new apply.Model({
				firstname: 'Patrick'
			});
			var model2 = new apply.Model().set(model1);

			expect(model2.attributes).toEqual(model1.attributes);
		});

		it('should support a getId method that will return whatever the id that the id property is mapped to', function () {
			expect(new(apply.Model({
				id: 'uid'
			}))({
				uid: 2
			}).getId()).toBe(2);
		});

		describe('events', function () {
			it('should support a change event that fires when any attribute changes', function () {
				var model = new apply.Model();

				model.on('change', callback);

				model.set({
					name: 'Dave'
				}, false);

				expect(callback).toHaveBeenCalledWith('Dave', 'name', model);
			});

			it('should support a change event that fires when any attribute changes', function () {
				var model = new apply.Model();

				model.on('change:name', callback);

				model.set({
					name: 'Dave'
				}, false);

				expect(callback).toHaveBeenCalledWith('Dave', model);
			});

			it('should fire change events when a clear occurs', function () {
				model.on('change:firstname', callback);
				model.on('change', callback);

				model.clear();

				expect(callback).toHaveBeenCalledWith(undefined, model);
				expect(callback).toHaveBeenCalledWith(undefined, 'firstname', model);
			});
		});
	});
})(this, this.apply);