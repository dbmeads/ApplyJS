(function (root, apply) {
	'use strict';

	describe('apply.Model', function () {

		it('should be able to construct a model that has attributes set on it', function () {
			var model = new apply.Model({
				name: 'Dave'
			});

			expect(model.attributes.name).toBe('Dave');
		});

		it('should be able to create a 2nd mixed in constructor from apply.Model by calling apply.Model.compose()', function () {
			var NewModel = apply.Model.compose({
				prop1: 'Model'
			});

			expect(NewModel.prototype.prop1).toBe('Model');
		});

		it('should support setting of attributes after a model is created without touching other attributes', function () {
			var model = new apply.Model({
				firstname: 'Dave'
			});

			model.set({
				lastname: 'Meads'
			});

			expect(model.attributes.firstname).toBe('Dave');
			expect(model.attributes.lastname).toBe('Meads');
		});

		it('should support the return of attributes via a get method', function () {
			var model = new apply.Model({
				firstname: 'Dave'
			});

			expect(model.get('firstname')).toBe('Dave');
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
				var check = jasmine.createSpy();

				model.on('change', function (name, key) {
					expect(name).toBe('Dave');
					expect(key).toBe('name');
					check();
				});

				model.set({
					name: 'Dave'
				}, false);

				expect(check).toHaveBeenCalled();
			});

			it('should support a change event that fires when any attribute changes', function () {
				var model = new apply.Model();
				var check = jasmine.createSpy();

				model.on('change:name', function (name) {
					expect(name).toBe('Dave');
					check();
				});

				model.set({
					name: 'Dave'
				}, false);

				expect(check).toHaveBeenCalled();
			});
		});
	});
})(this, this.apply);